'use client';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SendTransactionResponse, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { CHAIN, SendTransactionRequest } from '@tonconnect/sdk';
import { Address, Cell, contractAddress, toNano } from '@ton/core';
import { beginCell, TonClient, TupleItem } from '@ton/ton';
import Image from 'next/image';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  BASE_NANO_NUMBER,
  BASE_URL,
  ENDPOINT_MAINNET_RPC,
  ENDPOINT_TESTNET_RPC,
  isMainnet,
  pink_market_address, pink_market_fee_denominator, pink_market_fee_numerator,
  pink_mkt_create_sell_order_gas_fee,
  pink_order_sale_code_base64,
  t404_jetton_master_address,
} from '@/constant/config404';
import { v4 as uuidv4 } from 'uuid';
import { decimalFriendly } from '@/utils/util404';
import { SellOrderInfo } from '@/utils/interface404';
import { useRouter } from 'next/navigation';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Table, TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table';
import { BeatLoader } from 'react-spinners';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/components/ui/use-toast';
import { useInitData } from '@tma.js/sdk-react';

function generateUnique64BitInteger(): string {
  const uuid: string = uuidv4().replace(/-/g, '');
  const uuid64Bit: string = uuid.substr(0, 16);
  return BigInt('0x' + uuid64Bit).toString();
}

function buildTx(order: SellOrderInfo): SendTransactionRequest {
  let op_transfer_ft = 0xf8a7ea5;
  let op_deploy_pink_order_sale = 0x86c24f54;
  let forward_amount = '0.085';

  if (
    order.unitPriceInTon
    && order.extBizId
    && order.sellAmount
    && order.sellerT404Address
    && order.pinkMarketAddress
    && order.sellerAddress
  ) {
    let forward_payload = beginCell()
      .storeUint(op_deploy_pink_order_sale, 32)
      .storeCoins(toNano(order.unitPriceInTon)) //token_price
      .storeUint(BigInt(order.extBizId), 64) //必须确保 external_order_id 全局唯一
      .endCell().beginParse();

    let body = beginCell()
      .storeUint(op_transfer_ft, 32)  //op_code
      .storeUint(BigInt(order.extBizId), 64)  //query_id
      .storeCoins(toNano(order.sellAmount)) // the T404 jetton_amount you want to transfer
      .storeAddress(Address.parse(order.pinkMarketAddress))    //to_address, pink_market_address
      .storeAddress(Address.parse(order.sellerAddress))  //response_destination
      .storeBit(false)    //no custom payload
      .storeCoins(toNano(forward_amount))    //forward amount 0.085
      .storeSlice(forward_payload)   // forward payload
      .endCell();

    let bodyBase64 = body.toBoc().toString('base64');

    return {
      // The transaction is valid for 10 minutes from now, in unix epoch seconds.
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: order.sellerT404Address,
          amount: '' + toNano(pink_mkt_create_sell_order_gas_fee),
          payload: bodyBase64,
        },
      ],
    };
  } else {
    return {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [],
    };
  }
}


export default function Page({ params }: { params: { lang: string } }) {
  const router = useRouter();

  /* todo remove tma */
  // const tgInitData = useInitData();

  const tgInitData = { user: { id: 5499157826, username: '' } };

  let initOrder: SellOrderInfo = {};
  const [sellOrderInfo, setSellOrderInfo] = useState<SellOrderInfo>(initOrder);
  const [tx, setTx] = useState(buildTx(sellOrderInfo));
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
  const [jettonWallet, setJettonWallet] = useState('');
  const [jettonBalance, setJettonBalance] = useState('');
  let [jettonLoading, setJettonLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formSchema = z.object({
    sellAmount: z.coerce.number().gte(0, {
      message: 'T404 sell amount must be greater than 0.',
    }).max(1000, 'Sell amount must less than 1,000 in one order.'),
    unitPrice: z.coerce.number().gte(0, {
      message: 'Unit price must be greater than 0.',
    }).max(100000, 'Unit price must less than 100,000 Toncoins.'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    let rollbackTgId = '';
    let rollbackExtBizId = '';
    try {
      if (!wallet?.account?.address) {
        toast({
          title: 'WARN',
          description: `Please connect your wallet firstly!`,
          action: (
            <ToastAction altText="Goto schedule to undo">OK</ToastAction>
          ),
        });
        return;
      }
      if (jettonLoading) {
        toast({
          title: 'WARN',
          description: `Please wait the app to load your T404 balance!`,
          action: (
            <ToastAction altText="Goto schedule to undo">OK</ToastAction>
          ),
        });
        return;
      }
      if (values.sellAmount && values.sellAmount > parseFloat(jettonBalance)) {
        toast({
          title: 'ERROR',
          description: `You cannot sell more than your balance ${jettonBalance}!`,
          action: (
            <ToastAction altText="Goto schedule to undo">OK</ToastAction>
          ),
        });
        return;
      }

      setProcessing(true);
      let loginWalletAddress = wallet?.account?.address;
      if (loginWalletAddress) {
        let order: SellOrderInfo = {};
        order.pinkMarketAddress = pink_market_address;
        order.sellerAddress = Address.parse(loginWalletAddress).toString({
          bounceable: false,
          testOnly: !isMainnet,
        });

        if (!jettonWallet) {
          toast({
            title: 'ERROR!',
            description: 'Cannot find the T404 wallet address!',
            action: (
              <ToastAction altText="Goto schedule to undo">OK</ToastAction>
            ),
          });
          return;
        }
        order.sellerT404Address = jettonWallet;
        order.sellAmount = values.sellAmount;
        order.unitPriceInTon = values.unitPrice;
        let extBizId = generateUnique64BitInteger();
        console.info('extBizId', extBizId);
        order.extBizId = extBizId;

        // pink order sale address
        let order_sale_init_data = beginCell()
          .storeAddress(Address.parse(order.pinkMarketAddress)) // ;;marketplace_address
          .storeAddress(Address.parse(order.sellerAddress)) //;; owner_address
          .storeUint(BigInt(order.extBizId), 64) //;; order_id
          .endCell();
        let pink_order_sale = Cell.fromBase64(pink_order_sale_code_base64);
        let state_init = { code: pink_order_sale, data: order_sale_init_data };
        let pinkOrderSaleAddress = contractAddress(0, state_init);
        order.pinkOrderSaleAddress = pinkOrderSaleAddress.toString();
        // pink order sale address end

        // ==================== save to DB ====================
        let tgId = tgInitData?.user?.id;
        let tgUsername = tgInitData?.user?.username;
        if (!tgUsername) {
          tgUsername = '' + tgId;
        }
        order.sellerTgId = '' + tgId;
        order.sellerTgUsername = tgUsername;
        order.feeNumerator = pink_market_fee_numerator;
        order.feeDenominator = pink_market_fee_denominator;

        rollbackTgId = order.sellerTgId;
        rollbackExtBizId = order.extBizId;
        const res = await fetch(BASE_URL + '/api/pink/sell', {
          method: 'POST',
          body: JSON.stringify(order),
          headers: {
            'content-type': 'application/json',
          },
        });
        if (!res.ok) {
          console.log('Oops! Something is wrong when call API.');
        }
        // ==================== save to DB end ====================

        let sendTransactionRequest = buildTx(order);
        setTx(sendTransactionRequest);
        let sellTx: SendTransactionResponse = await tonConnectUi.sendTransaction(sendTransactionRequest);
        let txCells = Cell.fromBoc(Buffer.from(sellTx.boc, 'base64'));
        if (txCells && txCells[0]) {
          let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${tgId}&extBizId=${order.extBizId}&status=PENDING&access404=error_code_404`;
          const response = await fetch(urlWithParams);
          if (!response.ok) {
            console.error(urlWithParams);
            return;
          }
          setSubmitted(true);
        } else {
          console.info('User have not sign the tx!!!!!!');
          console.info(txCells);
        }
      } else {
        if (!tonConnectUi.connected) {
          return tonConnectUi.openModal();
        } else {
          console.error('Wallet connected, but not have wallet address!');
        }
      }
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      if (error instanceof Error) {
        console.error(error.message);
        if (error.message.indexOf('TON_CONNECT_SDK_ERROR')) {
          let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${rollbackTgId}&extBizId=${rollbackExtBizId}&status=INVALID&access404=error_code_404`;
          const response = await fetch(urlWithParams);
          if (!response.ok) {
            console.error(urlWithParams);
            return;
          }
        }
      }
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    if (wallet?.account) {
      if (isMainnet && wallet?.account.chain == CHAIN.TESTNET) {
        toast({
          title: 'Warning',
          description: 'You need to connect mainnet!',
          action: (
            <ToastAction altText="Goto schedule to undo">OK</ToastAction>
          ),
        });
        return;
      }

      if (!isMainnet && wallet?.account.chain == CHAIN.MAINNET) {
        toast({
          title: 'Warning',
          description: 'You need to connect testnet!',
          action: (
            <ToastAction altText="Goto schedule to undo">OK</ToastAction>
          ),
        });
        return;
      }

      const fetchData = async () => {
        try {
          const client = new TonClient(
            {
              endpoint: isMainnet ? ENDPOINT_MAINNET_RPC : ENDPOINT_TESTNET_RPC,
            });

          let ownerAddressCell = beginCell().storeAddress(Address.parse(wallet?.account.address)).endCell();
          let stack: TupleItem[] = [];
          stack.push({ type: 'slice', cell: ownerAddressCell });
          const master_tx = await client.runMethod(
            Address.parse(t404_jetton_master_address), 'get_wallet_address', stack);
          let jetton_master_result = master_tx.stack;
          let jettonWalletAddress = jetton_master_result.readAddress();
          const jetton_wallet_tx = await client.runMethod(
            jettonWalletAddress, 'get_wallet_data');
          let jetton_wallet_result = jetton_wallet_tx.stack;
          let jetton_balance_bigint = jetton_wallet_result.readBigNumber();

          let jettonBalance: string = Number(Number(jetton_balance_bigint) / BASE_NANO_NUMBER).toFixed(3);
          setJettonWallet(jettonWalletAddress.toString());
          setJettonBalance(jettonBalance);
          setJettonLoading(false);

        } catch (error) {
          let msg = 'Error: Fail to fetch data from TON RPC.';
          if (error instanceof Error) {
            msg = msg + error.message;
          }

          setJettonBalance('-');
          setJettonLoading(false);
          console.error(msg);
        }
      };

      // Only execute fetchData if running in the browser
      if (typeof window !== 'undefined') {
        fetchData().catch(r => {
          console.error('Sorry, I need window to run.' + r);
        });
      }
    }//if (wallet?.account){
  }, []);


  const normalizeInput = (value: any) => {
    if (parseFloat(value) < 0 || value === '-') {
      return '1';
    }

    if (/\.\d{3,}/.test(value)) {
      return parseFloat(value).toFixed(2);
    }

    return value;
  };

  return (
    <div className={'px-6'} style={{
      touchAction: 'manipulation',
      msTouchAction: 'manipulation',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
      msContentZooming: 'none',
      overflow: 'hidden',
      width: '100vw',
      height: '100vh',
    }}>
      <Breadcrumb className="pb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/#tab3">Pink Market</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Sell Order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {!submitted &&

        <Form {...form} >

          <div className=" text-xl font-bold">Your Balance</div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <Image src="/logo-circle.png" height={36} width={36}
                         alt="pop" /></TableCell>
                <TableCell>T404</TableCell>
                <TableCell>
                  <BeatLoader
                    color={'#ffffff'}
                    loading={jettonLoading}
                    size={12}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                  {decimalFriendly(jettonBalance)}
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
            <FormField
              control={form.control}
              name="sellAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sell Amount</FormLabel>
                  <FormControl>
                    <Input type="number" className="text-lg" placeholder=""
                           {...field}
                           onChange={(e) => field.onChange(normalizeInput(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many T404 you want to sell.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price in Toncoin</FormLabel>
                  <FormControl>
                    <Input type="number" className="text-lg" placeholder="" {...field}
                           onChange={(e) => field.onChange(normalizeInput(e.target.value))} />
                  </FormControl>
                  <FormDescription>
                    How much is a T404 for Toncoin?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant={'default'} disabled={processing}>
              {processing && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Submit</Button>

            <Button disabled={processing}
                    variant={'outline'}
                    className="ml-3" type="button"
                    onClick={() => {
                      router.push('/#tab3');
                    }}
            >
              Back</Button>
          </form>
        </Form>}

      {submitted && <div className="h-full my-auto flex flex-col items-center">
        <div className="mt-36"></div>
        <div className="text-xl">Sell Order Submitted.</div>
        <div className="text-gray-300">Your order submitted successfully.</div>

        <div className="mt-5"></div>

        <div className="flex gap-2"><Button disabled={processing}
                                            variant={'default'}
                                            className="" type="button"
                                            onClick={() => {
                                              router.push('/#tab3');
                                            }}
        >
          Back to Market
        </Button>
        </div>
      </div>}
    </div>
  );
}
