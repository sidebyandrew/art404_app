'use client';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import {
  BASE_URL,
  ENDPOINT_MAINNET_RPC, ENDPOINT_TESTNET_RPC,
  isMainnet, isStayTuned,
  pink_mkt_cancel_sell_order_gas_fee,
} from '@/constant/config404';
import { addressTrim, calculateTotal, decimalFriendly } from '@/utils/util404';
import { Result404, SellOrderInfo } from '@/utils/interface404';
import { PINK_SELL_ORDER_LIST_FOUND } from '@/utils/static404';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, Cell, toNano } from '@ton/core';
import { CHAIN, SendTransactionRequest } from '@tonconnect/sdk';
import { beginCell, TonClient } from '@ton/ton';
import { useInitData } from '@tma.js/sdk-react';
import { page_size } from '@/constant/config404';
import BigNumber from 'bignumber.js';

export default function Tab3Marketplace() {
  /* todo remove tma */
  // const tgInitData = useInitData();
  //
  const tgInitData = { user: { id: 5499157826, username: '' } };

  const router = useRouter();
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  const [sellOrderList, setSellOrderList] = useState<SellOrderInfo[]>([]);
  const [mySellOrderList, setMySellOrderList] = useState<SellOrderInfo[]>([]);
  const [historySellOrderList, setHistorySellOrderList] = useState<SellOrderInfo[]>([]);
  const [logMsg404, setLogMsg404] = useState('');
  const [listedChanged, setListedChanged] = useState('');
  const [myOrderChanged, setMyOrderChanged] = useState('');
  const { toast } = useToast();

  const [onsalePageNumber, setOnsalePageNumber] = useState(1);
  const [myOpenPageNumber, setMyOpenPageNumber] = useState(1);
  const [myHistoryNumber, setMyHistoryNumber] = useState(1);

  async function fetchSellOrderData(onsalePageNumber: number) {
    console.info('call /api/pink/listed');
    let logUrl;
    try {
      let urlWithParams = `${BASE_URL}/api/pink/listed?pagination=${onsalePageNumber}&access404=error_code_404`;
      const response = await fetch(urlWithParams);
      if (!response.ok) {
        console.error(urlWithParams);
        return;
      }
      const responseData = await response.json<Result404>();
      if (responseData.success && responseData.code == PINK_SELL_ORDER_LIST_FOUND) {
        setSellOrderList(responseData.result);
        setOnsalePageNumber(onsalePageNumber);
      } else {
        // if (onsalePageNumber > 1) {
        //   setOnsalePageNumber(onsalePageNumber - 1);
        // }
      }
    } catch (error) {
      let msg = 'Network Error: /api/pink/listed. \n';
      if (error instanceof Error) {
        msg = msg + error.message;
      }
      console.error('Error fetching data:', msg);
      quickToast('Error', msg);
    }
  }


  useEffect(() => {
    fetchSellOrderData(onsalePageNumber);
    //}, [listedChanged, onsalePageNumber]);
  }, [listedChanged]);

  async function fetchMyOrderData(myOpenPageNumber: number) {
    let logUrl;
    console.info('call /api/pink/my_orders');
    try {
      let loginWallet = wallet?.account?.address;
      console.info('0 loginWalletAddress=', loginWallet);
      if (loginWallet) {
        let loginWalletAddress = Address.parse(loginWallet).toString({
          bounceable: false,
          testOnly: !isMainnet,
        });

        let tgId = tgInitData?.user?.id;
        let urlWithParams = `${BASE_URL}/api/pink/my_orders?tgId=${tgId}&pagination=${myOpenPageNumber}&loginWalletAddress=${loginWalletAddress}&access404=error_code_404`;
        const response = await fetch(urlWithParams);
        if (!response.ok) {
          console.error(urlWithParams);
          return;
        }
        const responseData = await response.json<Result404>();
        if (responseData.success && responseData.code == PINK_SELL_ORDER_LIST_FOUND) {
          console.info('need auto check status');
          setMySellOrderList(responseData.result);
          //setMyOrderChanged('' + new Date());
          setMyOpenPageNumber(myOpenPageNumber);
          // auto  check status
          try {
            const client = new TonClient(
              {
                endpoint: isMainnet ? ENDPOINT_MAINNET_RPC : ENDPOINT_TESTNET_RPC,
              });

            for (const order of mySellOrderList) {
              console.info('auto check status', order.extBizId);
              if (order.pinkOrderSaleAddress) {
                if (order.status == 'ONSALE'
                  || order.status == 'CANCELED'
                  || order.status == 'LOCK'
                  || order.status == 'SOLD'
                  || order.status == 'INVALID') {
                  return;
                }
                const get_sale_data_tx = await client.runMethod(
                  Address.parse(order.pinkOrderSaleAddress), 'get_sale_data');
                let get_sale_data_result = get_sale_data_tx.stack;
                // -1 init ok，0 not init
                let initFlagBigInt = get_sale_data_result.readBigNumber();
                if (initFlagBigInt && Number(initFlagBigInt) == -1) {
                  if (order.sellerTgId) {
                    let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${order.sellerTgId}&extBizId=${order.extBizId}&status=ONSALE&access404=error_code_404`;
                    const response = await fetch(urlWithParams);
                    if (!response.ok) {
                      console.error(urlWithParams);
                      return;
                    } else {
                      console.info('check status successful, set to ONSALE', order.extBizId);
                    }
                  }
                }
              }
            }

          } catch (e) {
            console.error(e);
          }
          // auto  check status end
        } else {
          // if (myOpenPageNumber > 1) {
          //   setMyOpenPageNumber(myOpenPageNumber - 1);
          // }
        }
      }
    } catch (error) {
      let msg = 'Network Error: /api/pink/my_orders. \n';
      if (error instanceof Error) {
        msg = msg + error.message;
      }
      quickToast('Network Error', msg);
      console.error('Error fetching data:', msg);
    }
  }

  useEffect(() => {
    fetchMyOrderData(myOpenPageNumber);
  }, [myOrderChanged]);

  async function fetchMyHistoryData(myHistoryNumber: number) {
    try {
      let loginWallet = wallet?.account?.address;
      console.info('0 loginWalletAddress=', loginWallet);
      if (loginWallet) {
        let loginWalletAddress = Address.parse(loginWallet).toString({
          bounceable: false,
          testOnly: !isMainnet,
        });

        let tgId = tgInitData?.user?.id;
        let urlWithParams = `${BASE_URL}/api/pink/history?tgId=${tgId}&pagination=${myHistoryNumber}&loginWalletAddress=${loginWalletAddress}&access404=error_code_404`;
        const response = await fetch(urlWithParams);
        if (!response.ok) {
          console.error(urlWithParams);
          return;
        }
        const responseData = await response.json<Result404>();
        if (responseData.success && responseData.code == PINK_SELL_ORDER_LIST_FOUND) {
          setHistorySellOrderList(responseData.result);
          setMyHistoryNumber(myHistoryNumber);
        } else {
          // if (myHistoryNumber > 1) {
          //   setMyHistoryNumber(myHistoryNumber - 1);
          // }
        }
      }
    } catch (error) {
      let msg = 'Error: /api/pink/history. \n';
      if (error instanceof Error) {
        msg = msg + error.message;
      }
      quickToast('Network Error', msg);
      console.error('Error fetching data:', msg);
    }
  }

  useEffect(() => {
    fetchMyHistoryData(myHistoryNumber);
  }, [listedChanged, myOrderChanged]);

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

  async function clickBuy(sellOrderId: string) {

    if (!isValidWallet()) {
      return;
    }

    let order = sellOrderList.find(o => {
      return o.sellOrderId == sellOrderId;
    });

    if (order && order.sellAmount && order.unitPriceInTon
      && order.pinkOrderSaleAddress && order.extBizId
      && order.sellerAddress && wallet?.account?.address
    ) {
      if (Address.parse(order.sellerAddress).equals(Address.parse(wallet?.account?.address))) {
        quickToast('Oops', 'You cannot buy your own order. Do you want to cancel it?');
        return;
      }

      let a = new BigNumber(order.sellAmount);
      let u = new BigNumber(order.unitPriceInTon);
      let result = a.multipliedBy(u);
      let buyerPayTonAmt = result.toNumber() + 0.7;

      let op_buy = 0x1ee6bf43;
      let payloadCell = beginCell().storeUint(op_buy, 32)  //op_code
        .storeUint(BigInt(order.extBizId), 64)  //query_id
        .storeCoins(toNano(order.sellAmount))  //buyAmount
        .endCell();
      let payloadBase64 = payloadCell.toBoc().toString('base64');

      let tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: order.pinkOrderSaleAddress,
            amount: '' + toNano(buyerPayTonAmt),
            payload: payloadBase64,
          },
        ],
      };

      let buyTx = await tonConnectUi.sendTransaction(tx);
      let txCells = Cell.fromBoc(Buffer.from(buyTx.boc, 'base64'));
      let tgId = tgInitData?.user?.id;
      let loginWallet = wallet?.account?.address;
      console.info('send Buy TX success');
      if (txCells && txCells[0] && tgId && loginWallet) {
        console.info('Buy TX is success');
        let loginWalletAddress = Address.parse(loginWallet).toString({
          bounceable: false,
          testOnly: !isMainnet,
        });
        let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${tgId}&extBizId=${order.extBizId}&status=SOLD&loginWalletAddress=${loginWalletAddress}&access404=error_code_404`;
        const response = await fetch(urlWithParams);
        setListedChanged(order.extBizId + Date.now());
        if (!response.ok) {
          console.error(urlWithParams);
          return;
        } else {
          console.info(`SUCCESS: update sell_order ${order.extBizId}`);
        }
      } else {
        errorToast('Not call /api/sell_order/update_state' + sellOrderId);
      }
    } else {
      errorToast('SELL ORDER NOT FOUND WITH ID:' + sellOrderId);
    }
  }

  async function clickCancel(sellOrderId: string) {
    if (!isValidWallet()) {
      return;
    }
    console.info('sellOrderId to search', sellOrderId);
    console.info('sellOrderList', sellOrderList);

    let order = mySellOrderList.find(o => {
      return o.sellOrderId == sellOrderId;
    });


    console.info('order', order);
    if (order && order.sellAmount && order.unitPriceInTon
      && order.pinkOrderSaleAddress && order.extBizId) {

      let op_cancel_order = 0x68b4959e;
      let payloadCell = beginCell().storeUint(op_cancel_order, 32)  //op_code
        .storeUint(BigInt(order.extBizId), 64)  //query_id
        .endCell();
      ;
      let payloadBase64 = payloadCell.toBoc().toString('base64');

      let tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: order.pinkOrderSaleAddress,
            amount: '' + toNano(pink_mkt_cancel_sell_order_gas_fee),
            payload: payloadBase64,
          },
        ],
      };

      let cancelTx = await tonConnectUi.sendTransaction(tx);
      let txCells = Cell.fromBoc(Buffer.from(cancelTx.boc, 'base64'));

      let tgId = tgInitData?.user?.id;
      if (txCells && txCells[0] && tgId) {
        let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${tgId}&extBizId=${order.extBizId}&status=CANCELED&access404=error_code_404`;
        const response = await fetch(urlWithParams);
        setMyOrderChanged(order.extBizId + Date.now());
        if (!response.ok) {
          console.error(urlWithParams);
          return;
        }
      }
    } else {
      errorToast('SELL ORDER NOT FOUND WITH ID:' + sellOrderId);
    }
  }

  async function checkStatus(sellOrderId: string) {
    if (!isValidWallet()) {
      return;
    }

    let order = mySellOrderList.find(o => {
      return o.sellOrderId == sellOrderId;
    });

    if (order && order.sellAmount && order.unitPriceInTon
      && order.pinkOrderSaleAddress && order.extBizId) {
      try {
        const client = new TonClient(
          {
            endpoint: isMainnet ? ENDPOINT_MAINNET_RPC : ENDPOINT_TESTNET_RPC,
          });
        const get_sale_data_tx = await client.runMethod(
          Address.parse(order.pinkOrderSaleAddress), 'get_sale_data');
        let get_sale_data_result = get_sale_data_tx.stack;
        // -1 init ok，0 not init
        let initFlagBigInt = get_sale_data_result.readBigNumber();
        if (initFlagBigInt && Number(initFlagBigInt) == -1) {
          quickToast('Congratulation!', 'This order is valid for public on-sale.');
          let tgId = tgInitData?.user?.id;
          if (tgId) {
            let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${tgId}&extBizId=${order.extBizId}&status=ONSALE&access404=error_code_404`;
            const response = await fetch(urlWithParams);
            setMyOrderChanged(order.extBizId + Date.now());
            setListedChanged(order.extBizId + Date.now());
            if (!response.ok) {
              console.error(urlWithParams);
              return;
            }
          }
        } else {
          quickToast('Waiting', 'Please wait for smart contract initialization');
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          if (e.message.indexOf('Unable to execute get method.') == 0) {
            if (order.createDt && Date.now() - order.createDt > 1000 * 60 * 10) {
              quickToast('WARNING', 'This order is invalid, maybe you haven\'t sign with your wallet. Order status will set to INVALID.');
              let tgId = tgInitData?.user?.id;
              if (tgId) {
                let urlWithParams = `${BASE_URL}/api/sell_order/update_state?tgId=${tgId}&extBizId=${order.extBizId}&status=INVALID&access404=error_code_404`;
                setMyOrderChanged(order.extBizId + Date.now());
                setListedChanged(order.extBizId + Date.now());
                const response = await fetch(urlWithParams);
                if (!response.ok) {
                  console.error(urlWithParams);
                  return;
                }
              }
            } else {
              if (order.status == 'INIT') {
                quickToast('Please wait...', 'Please make sure to sign with your wallet.\nThe smart contract of this order need some time to deploy. ');
              } else {
                quickToast('Please wait...', 'The smart contract of this order need some time to deploy. ');
              }
            }
          } else {
            quickToast('Congratulation!', 'This order is valid for public on-sale.');
          }
        }
      }
    } else {
      errorToast('SELL ORDER NOT FOUND WITH ID:' + sellOrderId);
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

  function errorToast(errorCode: string) {
    quickToast('Error', `There is a system error, contact us pls. Error Code:[${errorCode}]`);
  }

  function badgeColor(status: string | undefined) {

    // INIT, PENDING, ONSALE, LOCK, SOLD, CANCELED, INVALID;

    if ('INIT' == status) {
      return 'gray';
    } else if ('PENDING' == status) {
      return 'purple';
    } else if ('ONSALE' == status) {
      return 'green';
    } else if ('LOCK' == status) {
      return 'purple';
    } else if ('SOLD' == status) {
      return 'blue';
    } else if ('CANCELED' == status) {
      return 'destructive';
    } else if ('INVALID' == status) {
      return 'secondary';
    } else {
      return 'outline';
    }

  }

  return (
    <div className="p-3">
      <div className="mb-3 text-2xl font-bold">ART-404 Pink Market
      </div>

      {isStayTuned &&
        <div>
          <div className="pt-5 flex justify-center text-white dark:text-white text-xl text-border">
            🚀 Will Open After Mainnet Fair Mint
          </div>
        </div>
      }

      {!isStayTuned &&
        <Tabs defaultValue="listed" className="mx-auto">
          <TabsList>
            <TabsTrigger onClick={() => {
              setListedChanged('' + new Date());
            }} value="listed">Public On-Sale</TabsTrigger>
            <TabsTrigger onClick={() => {
              setMyOrderChanged('' + new Date());
            }} value="myOrders">My Open Orders</TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>
          <TabsContent value="listed" className="">
            <div className="  ">
              <Button className="flex ml-auto"
                      onClick={() => {
                        if (!isValidWallet()) {
                          return;
                        }
                        router.push('/pink/order_form');
                      }}
              >New Order</Button>
            </div>

            {/*  orders  */}
            <Table>
              <TableCaption>
                <div className={'p-1'}>Sort by price from lowest to highest.</div>

                {/*pagination */}
                <Pagination className={'p-2'}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={
                        async () => {
                          if (onsalePageNumber > 1) {
                            //setOnsalePageNumber(onsalePageNumber - 1);
                            await fetchSellOrderData(onsalePageNumber - 1);
                          }
                        }
                      } />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{onsalePageNumber}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={
                        async () => {
                          if (sellOrderList && sellOrderList.length == page_size) {
                            await fetchSellOrderData(onsalePageNumber + 1);
                          }
                        }
                      } />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {/*pagination end*/}


              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead className="w-[100px]">Seller</TableHead>
                  <TableHead>T404</TableHead>
                  <TableHead className="">Price <div className={'font-light text-sm'}>(TON)</div></TableHead>
                  <TableHead className="">Total <div className={'font-light text-sm'}>(TON)</div></TableHead>
                  <TableHead className="">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellOrderList.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="">{(onsalePageNumber - 1) * page_size + index + 1}</TableCell>
                    <TableCell
                      className="font-extralight text-sm">{addressTrim(order.sellerAddress)}</TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>{decimalFriendly(order.unitPriceInTon)}</TableCell>
                    <TableCell
                      className="">{calculateTotal(order.sellAmount, order.unitPriceInTon)}</TableCell>
                    <TableCell className="ml-auto">
                      <Button
                        about={order.sellOrderId}
                        variant={'outline'}
                        onClick={() => {
                          if (order.sellOrderId) {
                            clickBuy(order.sellOrderId);
                          } else {
                            errorToast('SELL ORDER ID NOT FOUND');
                          }
                        }}
                      >
                        Buy
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="flex w-full flex-col pb-20">&nbsp;</div>
            {/*  orders end  */}

          </TabsContent>
          <TabsContent value="myOrders">
            <Table>
              <TableCaption>
                <div className={'p-1'}>Sort by create time.</div>
                {/*pagination */}
                <Pagination className={'p-2'}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={
                        async () => {
                          if (myOpenPageNumber > 1) {
                            // setMyOpenPageNumber(myOpenPageNumber - 1);
                            await fetchMyOrderData(onsalePageNumber - 1);
                          }
                        }
                      } />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{myOpenPageNumber}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={
                        async () => {
                          if (mySellOrderList && mySellOrderList.length == page_size) {
                            //setMyOpenPageNumber(myOpenPageNumber + 1);
                            await fetchMyOrderData(myOpenPageNumber + 1);
                          }
                        }
                      } />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {/*pagination end*/}
              </TableCaption>
              <TableHeader>
                <TableRow className="text-center text-sm">
                  <TableHead className="px-0 text-center">#</TableHead>
                  <TableHead className="px-0 text-center">T404</TableHead>
                  <TableHead className="px-0 text-center">Price</TableHead>
                  <TableHead className="px-0 text-center">Total</TableHead>
                  <TableHead className="px-0 text-center">Status</TableHead>
                  <TableHead className="px-0 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {mySellOrderList.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="">{(myOpenPageNumber - 1) * page_size + index + 1}</TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>{decimalFriendly(order.unitPriceInTon)}</TableCell>
                    <TableCell
                      className="">{calculateTotal(order.sellAmount, order.unitPriceInTon)}</TableCell>
                    <TableCell className="">
                      <Badge
                        variant={badgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="">
                      {(order.status == 'INIT' || order.status == 'PENDING') && <Button
                        variant={'default'}
                        size={'sm'}
                        onClick={() => {
                          if (order.sellOrderId) {
                            checkStatus(order.sellOrderId);
                          } else {
                            errorToast('SELL ORDER ID NOT FOUND');
                          }
                        }}
                      >
                        Check Status
                      </Button>}
                      {order.status == 'ONSALE' && <Button
                        variant={'outline'}
                        size={'sm'}
                        onClick={() => {
                          if (order.sellOrderId) {
                            clickCancel(order.sellOrderId);
                          } else {
                            errorToast('SELL ORDER ID NOT FOUND');
                          }
                        }}
                      >
                        Cancel</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="flex w-full flex-col pb-24">&nbsp;</div>

          </TabsContent>
          <TabsContent value="history">
            <Table>
              <TableCaption>
                <div className={'p-1'}>Sort by create time.</div>
                {/*pagination */}
                <Pagination className={'p-2'}>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={
                        async () => {
                          if (myHistoryNumber > 1) {
                            // setMyHistoryNumber(myHistoryNumber - 1);
                            await fetchMyHistoryData(myHistoryNumber - 1);
                          }
                        }
                      } />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{myHistoryNumber}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={
                        async () => {
                          if (historySellOrderList && historySellOrderList.length == page_size) {
                            // setMyHistoryNumber(myHistoryNumber + 1);
                            await fetchMyHistoryData(myHistoryNumber + 1);
                          }
                        }
                      } />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {/*pagination end*/}

              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>T404</TableHead>
                  <TableHead className="">Price</TableHead>
                  <TableHead className="">Total</TableHead>
                  <TableHead className="">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historySellOrderList.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="">{(myHistoryNumber - 1) * page_size + index + 1}</TableCell>
                    <TableCell>{decimalFriendly(order.sellAmount)}</TableCell>
                    <TableCell>{decimalFriendly(order.unitPriceInTon)}</TableCell>
                    <TableCell
                      className="">{calculateTotal(order.sellAmount, order.unitPriceInTon)}</TableCell>
                    <TableCell className="">
                      <Badge
                        variant={badgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="flex w-full flex-col pb-24">&nbsp;</div>
            <div className="flex w-full flex-col pb-24">&nbsp;</div>
          </TabsContent>
        </Tabs>
      }

      <div className="flex w-full flex-col pb-20">&nbsp;</div>
      <div className="mt-20  text-gray-600 text-center">
        <Popover>
          <PopoverTrigger className="text-gray-400">The trend is your friend.</PopoverTrigger>
          <PopoverContent
            className={'w-[300px] break-all'}>
            <div className={'break-all'}>{logMsg404}</div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex w-full flex-col pb-10">&nbsp;</div>

    </div>
  );
};

