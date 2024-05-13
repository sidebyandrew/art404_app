import React, { CSSProperties, useEffect, useState } from 'react';
import { beginCell, TonClient, TupleItem } from '@ton/ton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  BASE_NANO_NUMBER,
  ENDPOINT_MAINNET_RPC,
  ENDPOINT_TESTNET_RPC,
  isMainnet,
  old_t404_jetton_master_address,
  pink_mkt_create_sell_order_gas_fee,
  t404_jetton_master_address,
  t404_upgrade_v1_to_v2_contract,
} from '@/constant/config404';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Address, Cell, toNano } from '@ton/core';
import { SendTransactionResponse, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { BeatLoader } from 'react-spinners';
import { CHAIN, SendTransactionRequest } from '@tonconnect/sdk';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { decimalFriendly } from '@/utils/util404';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'white',
};
export default function Tab2Asset() {
  const [jettonBalance, setJettonBalance] = useState('');
  const [jettonAddress, setJettonAddress] = useState('');

  let [jettonLoading, setJettonLoading] = useState(true);
  const [nftCount, setNftCount] = useState('');
  let [nftLoading, setNftLoading] = useState(true);
  const [nftCollection, setNftCollection] = useState('');

  const [userData, setUserData] = useState(null);
  const [logMsg404, setLogMsg404] = useState('');

  let [oldT404Existing, setOldT404Existing] = useState(false);

  let [oldT404Address, setOldT404Address] = useState('');
  const [oldT404Balance, setOldT404Balance] = useState(0);
  let [oldT404Upgrading, setOldT404Upgrading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { toast } = useToast();
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();


  // 1. 定义验证逻辑
  const formSchema = z.object({
    receiverAddress: z.coerce.string().length(48, { message: 'Address length must be 48.' }),
    sendAmount: z.coerce.number().gte(0, {
      message: 'Send Amount must be greater than 0.',
    }).max(10000, 'Send Amount must less than 10,000.'),
  });

  // 2. 定义表单组件实例（解析器，默认值）
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // 3. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.info('=============');
    console.info('======onSubmit=======');
    console.info('======onSubmit=======');
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
      if (values.sendAmount && values.sendAmount > parseFloat(jettonBalance)) {
        toast({
          title: 'ERROR',
          description: `You cannot sell more than your balance ${jettonBalance}!`,
          action: (
            <ToastAction altText="Goto schedule to undo">OK</ToastAction>
          ),
        });
        return;
      }

      if (isMainnet && values.receiverAddress) {
        if (!(values.receiverAddress.startsWith('UQ') || values.receiverAddress.startsWith('EQ'))) {
          toast({
            title: 'ERROR',
            description: `Mainnet address must start with UQ or EQ!`,
            action: (
              <ToastAction altText="Goto schedule to undo">OK</ToastAction>
            ),
          });
          return;
        }
      }
      if (!isMainnet && values.receiverAddress) {
        if (!(values.receiverAddress.startsWith('kQ') || values.receiverAddress.startsWith('0Q'))) {
          toast({
            title: 'ERROR',
            description: `Testnet address must start with kQ or 0Q!`,
            action: (
              <ToastAction altText="Goto schedule to undo">OK</ToastAction>
            ),
          });
          return;
        }
      }

      setProcessing(true);
      let loginWalletAddress = wallet?.account?.address;
      if (loginWalletAddress) {
        let op_transfer_ft = 0xf8a7ea5;
        let forward_amount = '0.085';
        let forward_payload = beginCell()
          .storeUint(BigInt(0), 64)
          .endCell().beginParse();

        let body = beginCell()
          .storeUint(op_transfer_ft, 32)  //op_code
          .storeUint(BigInt(0), 64)  //query_id
          .storeCoins(toNano(values.sendAmount)) // the T404 jetton_amount you want to transfer
          .storeAddress(Address.parse(values.receiverAddress))    //to_address, pink_market_address
          .storeAddress(Address.parse(loginWalletAddress))  //response_destination
          .storeBit(false)    //no custom payload
          .storeCoins(toNano(forward_amount))    //forward amount 0.085
          .storeSlice(forward_payload)   // forward payload
          .endCell();
        let bodyBase64 = body.toBoc().toString('base64');

        let tx: SendTransactionRequest = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address: jettonAddress,
              amount: '' + toNano(pink_mkt_create_sell_order_gas_fee),
              payload: bodyBase64,

            },
          ],
        };
        let sellTx: SendTransactionResponse = await tonConnectUi.sendTransaction(tx);

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
      }
      console.error('Transfer error :', error);
    }
  }


  function quickToast(title: string, description: string) {
    toast({
      title: title,
      description: description,
      action: (
        <ToastAction
          altText="OK">OK</ToastAction>
      ),
    });
  }

  function isValidWallet() {
    let success = true;
    if (isMainnet && wallet?.account.chain == CHAIN.TESTNET) {
      success = false;
      quickToast('Warning', 'You need to connect mainnet!');
    }

    if (!isMainnet && wallet?.account.chain == CHAIN.MAINNET) {
      success = false;
      quickToast('Warning', 'You need to connect mainnet!');
    }

    if (!wallet?.account?.address) {
      success = false;
      quickToast('Warning', 'You need to connect wallet!');
    }

    return success;
  }

  // get old jetton info  old_t404_jetton_master_address
  // get old jetton info  old_t404_jetton_master_address
  // get old jetton info  old_t404_jetton_master_address
  // get old jetton info  old_t404_jetton_master_address
  // get old jetton info  old_t404_jetton_master_address

  async function processUpgrade() {

    if (!isValidWallet()) {
      return;
    }

    let oldAddress = Address.parse(oldT404Address);
    if (wallet?.account?.address && oldAddress) {
      if (oldT404Balance == 0) {
        quickToast('Check your old T404 balance', 'Old T404 balance is 0.');
        return;
      }

      console.error(oldAddress);
      let op_update_t404 = 0xe2188ce;
      let forward_payload = beginCell().storeUint(op_update_t404, 32)  //op_code
        .endCell();

      let op_transfer_ft = 0xf8a7ea5;
      let payloadCell = beginCell().storeUint(op_transfer_ft, 32)
        .storeUint(0, 64)  //query_id
        .storeCoins(toNano(oldT404Balance)) // the jetton_amount you want to transfer
        .storeAddress(Address.parse(t404_upgrade_v1_to_v2_contract))  //to_address, Upgrade_v1_to_v2
        .storeAddress(Address.parse(wallet?.account?.address))    // response_destination TON Wallet Address
        .storeBit(false)    //no custom payload
        .storeCoins(toNano(0.7))    //forward amount = forward_gas_fee
        .storeSlice(forward_payload.asSlice())   //forward payload
        .endCell();
      let payloadBase64 = payloadCell.toBoc().toString('base64');

      let tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: oldT404Address,
            amount: '' + toNano(1),
            payload: payloadBase64,
          },
        ],
      };

      let upgradeTx = await tonConnectUi.sendTransaction(tx);
      let txCells = Cell.fromBoc(Buffer.from(upgradeTx.boc, 'base64'));
      let loginWallet = wallet?.account?.address;
      if (txCells && txCells[0] && loginWallet) {
        quickToast('Submitted', 'Upgrade request submitted. Please 5 minutes to check result!');
        setOldT404Upgrading(true);
      }
    } else {
      quickToast('Wallet?', 'Connect Wallet!');
    }
  }

  // get old jetton info
  // get old jetton info
  // get old jetton info
  // get old jetton info
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
            Address.parse(old_t404_jetton_master_address), 'get_wallet_address', stack);
          let jetton_master_result = master_tx.stack;
          let jettonWalletAddress = jetton_master_result.readAddress();
          let oldT404Address = jettonWalletAddress.toString({
            bounceable: false,
            testOnly: !isMainnet,
          });
          setOldT404Address(oldT404Address);
          const jetton_wallet_tx = await client.runMethod(
            jettonWalletAddress, 'get_404_wallet_data');
          let jetton_wallet_result = jetton_wallet_tx.stack;

          let jetton_balance_bigint = jetton_wallet_result.readBigNumber();
          let owner_address = jetton_wallet_result.readAddress();
          let jetton_master_address = jetton_wallet_result.readAddress();
          let jetton_wallet_code = jetton_wallet_result.readCell();
          let nft_item_code = jetton_wallet_result.readCell();
          let nft_collection_address = jetton_wallet_result.readAddress();
          let owned_nft_dict = jetton_wallet_result.readCellOpt();
          let owned_nft_number = jetton_wallet_result.readBigNumber();
          let owned_nft_limit = jetton_wallet_result.readBigNumber();
          let pending_reduce_jetton_balance = jetton_wallet_result.readBigNumber();
          let pending_burn_nft_queue = jetton_wallet_result.readCellOpt();


          let jettonBalance: number = Number(Number(jetton_balance_bigint) / BASE_NANO_NUMBER);
          console.info('OldT404Balance=', jettonBalance);
          setOldT404Balance(jettonBalance);
          setOldT404Existing(true);
        } catch (error) {
          let msg = 'Error: Fail to fetch data from TON RPC. \n';
          if (error instanceof Error) {
            msg = msg + error.message;
          }
          console.error(msg);
          setOldT404Balance(-1);
          setOldT404Existing(false);
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
          setJettonAddress(jettonWalletAddress.toString({
            bounceable: false,
            testOnly: !isMainnet,
          }));

          const jetton_wallet_tx = await client.runMethod(
            jettonWalletAddress, 'get_404_wallet_data');
          let jetton_wallet_result = jetton_wallet_tx.stack;


          // ds~load_coins(),    ;; jetton_balance
          // ds~load_msg_addr(),    ;; owner_address
          // ds~load_msg_addr(),    ;;jetton_master_address
          // ds~load_ref(),         ;; jetton_wallet_code   Jetton wallet standard end
          // let jetton_balance_bigint = jetton_wallet_result.readBigNumber();
          // let owner_address = jetton_wallet_result.readAddress();
          // let jetton_master_address = jetton_wallet_result.readAddress();
          // let jetton_wallet_code = jetton_wallet_result.readCell();
          // ds~load_ref(),       ;; nft_item_code
          // let nft_item_code = jetton_wallet_result.readCell();
          // ds~load_msg_addr(),   ;;nft_collection_address
          // let nft_collection_address = jetton_wallet_result.readAddress();
          // ds~load_dict(),       ;;owned_nft_dict
          // let owned_nft_dict = jetton_wallet_result.readCellOpt();
          // ds~load_int(item_index_length() + 1),         ;;owned_nft_number
          // ds~load_uint(item_index_length()),       ;;next_item_index
          // ds~load_uint(userid_prefix_length()),       ;;user_id  ,because getgems.io only support up to 54 bits for nft_item_index
          //     ds~load_uint(item_index_length()),         ;;owned_nft_limit
          // ds~load_coins(),       ;; pending_reduce_ jetton_balance
          // ds~load_dict() );      ;; pending_burn_nft_queue

          let jetton_balance_bigint = jetton_wallet_result.readBigNumber();
          let owner_address = jetton_wallet_result.readAddress();
          let jetton_master_address = jetton_wallet_result.readAddress();
          let jetton_wallet_code = jetton_wallet_result.readCell();
          let nft_item_code = jetton_wallet_result.readCell();
          let nft_collection_address = jetton_wallet_result.readAddress();
          let owned_nft_dict = jetton_wallet_result.readCellOpt();
          let owned_nft_number = jetton_wallet_result.readBigNumber();
          let owned_nft_limit = jetton_wallet_result.readBigNumber();
          let pending_reduce_jetton_balance = jetton_wallet_result.readBigNumber();
          let pending_burn_nft_queue = jetton_wallet_result.readCellOpt();


          let jettonBalance: string = Number(Number(jetton_balance_bigint) / BASE_NANO_NUMBER).toFixed(3);
          console.info(jetton_balance_bigint);
          console.info(jettonBalance);
          setJettonBalance(jettonBalance);
          setJettonLoading(false);

          setNftCount('' + owned_nft_number);
          setNftLoading(false);

          let nftCollAddress = nft_collection_address.toString({ bounceable: true, testOnly: false });
          setNftCollection(nftCollAddress);

        } catch (error) {
          let msg = 'Error: Fail to fetch data from TON RPC. \n';
          if (error instanceof Error) {
            msg = msg + error.message;
          }
          setJettonBalance('-');
          setJettonLoading(false);
          setNftCount('-');
          setNftLoading(false);
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


  function sellOnGetgems(isMainnet: boolean, wallet: string | undefined, collection: string) {
    if (window && wallet && collection) {
      let friendlyWalletAddress = Address.parse(wallet).toString({ testOnly: false, bounceable: true });
      let urlBase = isMainnet ? 'https://getgems.io/user/' : 'https://testnet.getgems.io/user/';
      let urlTemplate = urlBase +
        `${friendlyWalletAddress}?filter=%7B%22collections%22%3A%5B%22${collection}%22%5D%7D#collected`;
      window.open(urlTemplate);
    } else {
      toast({
        title: 'Do you have any T404 NFT to sell? ',
        description: '[Respect to Tonkeeper] Something happened but we don\'t understand what. ',
        action: (
          <ToastAction altText="Goto schedule to undo">OK</ToastAction>
        ),
      });
    }
  }


  return (
    <div className="p-3">
      {oldT404Existing &&
        <div>
          <div className=" text-xl font-bold">Old 404 Jettons</div>

          {oldT404Upgrading &&
            <div className="pt-2 pb-2 text-xl font-bold text-red-400">Old 404 Upgrading, check result 5 minutes later,
              DO NOT
              submit again!</div>}
          <Table>
            <TableCaption>
              <div className={'pb-3'}>* Need 0.4 Toncoin for upgrading gas fee, pay 1 Toncoin firstly, excess will be
                refunded.
              </div>
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">
                  #
                </TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <Image src="/logos/ART-404-gray.png" height={36} width={36}
                         alt="" />
                </TableCell>
                <TableCell>Old T404</TableCell>
                <TableCell>
                  {oldT404Balance}
                </TableCell>
                <TableCell className="text-center"><Button
                  size={'lg'}
                  variant={'default'}
                  disabled={oldT404Upgrading}
                  onClick={() => {
                    if (isMainnet && wallet?.account.chain == CHAIN.TESTNET) {
                      return;
                    }

                    if (!isMainnet && wallet?.account.chain == CHAIN.MAINNET) {
                      return;
                    }
                    return processUpgrade();
                  }
                  }>
                  Upgrade
                </Button></TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      }

      <div className=" text-xl font-bold">New 404 Jettons</div>

      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">
              #
            </TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium"> <Image src="/logo-circle.png" height={36} width={36}
                                                       alt="pop" /></TableCell>
            <TableCell>T404</TableCell>
            <TableCell>
              <BeatLoader
                color={'#ffffff'}
                loading={jettonLoading}
                cssOverride={override}
                size={12}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              {decimalFriendly(jettonBalance)}
            </TableCell>
            <TableCell className="text-center">


              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={jettonLoading}>Transfer</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Transfer T404</DialogTitle>
                    <DialogDescription>
                      Transfer Your T404 to other Wallet Address
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="receiverAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Wallet Address</FormLabel>
                            <FormControl>
                              <Input placeholder="UQ..." {...field} className={'font-extralight text-sm'} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sendAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>T404 Amount </FormLabel>
                            <FormControl>
                              <Input placeholder="amount" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your T404 Balance: {jettonBalance}
                            </FormDescription>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Submit</Button>
                      </DialogFooter>
                    </form>
                  </Form>


                </DialogContent>
              </Dialog>


            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>


      <div className="mt-3 text-xl font-bold">404 Collectibles</div>
      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">
              #
            </TableHead>
            <TableHead>NFT</TableHead>
            <TableHead>Count</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium"> <Image src="/vivid.png" height={36} width={36}
                                                       alt="pop" /></TableCell>
            <TableCell>404 Replicant NFT</TableCell>
            <TableCell>
              <BeatLoader
                color={'#ffffff'}
                loading={nftLoading}
                cssOverride={override}
                size={12}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              {nftCount}
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant={'outline'}
                disabled={nftLoading}
                onClick={() => {
                  sellOnGetgems(isMainnet, wallet?.account.address, nftCollection);
                }}>
                <svg className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 36 36" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd"
                        d="M18 2c0 8.837-7.163 16-16 16C2 9.163 9.163 2 18 2zm0 32C9.163 34 2 26.837 2 18c8.837 0 16 7.163 16 16zm16-16c0 8.837-7.163 16-16 16 0-8.837 7.163-16 16-16zM32 4c0 6.627-5.373 12-12 12 0-6.627 5.373-12 12-12z"
                        fill="currentColor"></path>
                </svg>
                Sell</Button>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex justify-end mr-2">
        <Popover>
          <PopoverTrigger className="text-gray-400">* Notes for Getgems</PopoverTrigger>
          <PopoverContent>The index of Getgems has a delay, at some time you need to refresh metadata
            manually at Getgems website.
          </PopoverContent>
        </Popover>
      </div>


      <div className="flex w-full flex-col pb-20">&nbsp;</div>
      <div className="mt-20 mb-20 text-gray-600 text-center">
        <Popover>
          <PopoverTrigger className="text-gray-400">It takes money to make money....</PopoverTrigger>
          <PopoverContent>{logMsg404}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};


