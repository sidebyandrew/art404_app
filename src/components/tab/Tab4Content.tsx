'use client';
import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ClipboardCopyIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
import { Button } from '@/components/ui/button';
import { BASE_URL, isMainnet, page_size } from '@/constant/config404';
import { ActionInfo, Result404, User404 } from '@/utils/interface404';
import {
  ACTION_LIST_FOUND,
  REF_REWARD_BUY,
  REF_REWARD_MINT,
  REF_USER_LIST_FOUND,
  REWARD_SUM_SUCCESS,
} from '@/utils/static404';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/components/ui/use-toast';
import { Address } from '@ton/core';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useInitData } from '@tma.js/sdk-react';

const rules = [
  {
    title: 'Invite friends with your personal link.',
    description: '2 points per friend. (Max 1000 points)   (Note: Invite friends award at Testnet will be kept.)',
  },
  {
    title: 'Your friends mint a T404! (only Mainnet)',
    description: 'If your friends mint 1 T404, you will get 50 points reward.',
  },
  {
    title: 'Your friends buy a T404! (only Mainnet)',
    description: 'If your friends buy 1 T404, you will get 5 points reward.',
  },
];

export default function Tab4Airdrop() {

  // /* todo remove tma */
  // const tgInitData = useInitData();
  //
  const tgInitData = { user: { id: 5499157826, username: '' } };

  const [userData, setUserData] = useState<User404>({
    tgId: '',
    tgUsername: '',
    refCode: '',
    refTgId: '',
    refTgUsername: '',
  });
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
  const [refActionReward, setRefActionReward] = useState('');
  const [rewardPageNumber, setRewardPageNumber] = useState(1);
  const [rewardList, setRewardList] = useState<ActionInfo[]>([]);
  const [rewardPageChanged, setRewardPageChanged] = useState('');
  const [open, setOpen] = React.useState(false);
  const handleCopy = async () => {
    try {

      if (userData && userData.refCode) {
        let refLink = `https://t.me/art404bot?start=${userData.refCode}`;
        await navigator.clipboard.writeText(refLink);
        quickToast('Copied!', refLink);
      } else {
        quickToast('Error!', 'please reload and try again!');
      }
    } catch (error) {
      console.error('Fail to copy referral code：', error);
    }
  };


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

  function getRefFriendsPoints(): number {
    let result = 0;
    if (userData?.refCount) {
      let count = parseInt(userData.refCount);
      result = count * 2 > 1000 ? 1000 : count * 2;
    }
    return result;
  }

  function getTotalRefPoints(): number {
    let result = 0;
    if (refActionReward) {
      result = parseInt(refActionReward);
    }
    if (userData?.refCount) {
      result = result + getRefFriendsPoints();
    }
    return result;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        let tgId = tgInitData?.user?.id;
        let tgUsername = tgInitData?.user?.username;
        if (!tgUsername) {
          tgUsername = '' + tgId;
        }

        let urlWithParams = `${BASE_URL}/api/user?tgId=${tgId}&tgUsername=${tgUsername}&access404=error_code_404`;
        const response = await fetch(urlWithParams);
        if (!response.ok) {
          console.error(urlWithParams);
          return;
        }
        const responseData = await response.json<Result404>();
        if (responseData.success && responseData.code == REF_USER_LIST_FOUND) {
          setUserData(responseData.result);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);


  useEffect(() => {
    async function fetchData() {
      try {
        let tgId = tgInitData?.user?.id;
        let urlWithParams = `${BASE_URL}/api/referral/sum_reward?tgId=${tgId}&access404=error_code_404`;
        const response = await fetch(urlWithParams);
        if (!response.ok) {
          console.error(urlWithParams);
          return;
        }
        const responseData = await response.json<Result404>();
        if (responseData.success && responseData.code == REWARD_SUM_SUCCESS) {
          setRefActionReward(responseData.result);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  async function fetchRewardList(myOpenPageNumber: number) {
    console.info('call fetchRewardList');
    try {
      let loginWallet = wallet?.account?.address;
      if (loginWallet) {
        let loginWalletAddress = Address.parse(loginWallet).toString({
          bounceable: false,
          testOnly: !isMainnet,
        });

        let tgId = tgInitData?.user?.id;
        let urlWithParams = `${BASE_URL}/api/referral/reward_list?tgId=${tgId}&pagination=${myOpenPageNumber}&access404=error_code_404`;
        const response = await fetch(urlWithParams);
        if (!response.ok) {
          console.error(urlWithParams);
          return;
        }
        const responseData = await response.json<Result404>();
        if (responseData.success && responseData.code == ACTION_LIST_FOUND) {
          setRewardList(responseData.result);
          setRewardPageNumber(myOpenPageNumber);
        }
      }
    } catch (error) {
      let msg = 'Network Error: /api/referral/reward_list. \n';
      if (error instanceof Error) {
        msg = msg + error.message;
      }
      quickToast('Network Error', msg);
      console.error('Error fetching data:', msg);
    }
  }

  useEffect(() => {
    fetchRewardList(rewardPageNumber);
  }, [rewardPageChanged]);

  function convertActionType(type: string | undefined) {
    if (type == REF_REWARD_MINT) {
      return 'Mint';
    } else if (type == REF_REWARD_BUY) {
      return 'Buy';
    } else {
      return '-';
    }
  }

  return (
    <div className="p-3">
      {/*  Points  */}
      <div className="mt-2 text-xl font-bold">404 Honor Points</div>
      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">
              #
            </TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Friends</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              <Image src="/icon/best-icon.jpg" height={36} width={36}
                     alt="pop" />
            </TableCell>
            <TableCell
              className=" text-center text-nowrap">{getTotalRefPoints()}</TableCell>
            <TableCell className="text-center">
              {userData ? userData.refCount : '-'}
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant={'outline'}
                onClick={() => {
                  setOpen(!open);
                }}
              >
                Claim T404
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      {/*  Points End */}

      {/* card */}
      <Card className={''}>
        <CardHeader>
          <CardTitle>Rules for Fair Mint Season</CardTitle>
          <CardDescription>How to earn 404 honor points?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 rounded-sm">
          <div>
            {rules.map((rule, index) => (
              <div
                key={index}
                className="mb-1 grid grid-cols-[25px_1fr] items-start pb-2 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-md bg-sky-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {rule.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCopy}>
            <ClipboardCopyIcon className="mr-2 h-4 w-4" /> Copy Your Referral Link
          </Button>
        </CardFooter>
      </Card>
      {/* card end */}

      {/*table*/}
      <div className="flex w-full flex-col pb-5">&nbsp;</div>
      <Table>
        <TableCaption>
          <div className={'p-1'}>Sort by create date in reverse order.</div>

          {/*pagination */}
          <Pagination className={'p-2'}>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={
                  async () => {
                    if (rewardPageNumber > 1) {
                      await fetchRewardList(rewardPageNumber - 1);
                    }
                  }
                } />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{rewardPageNumber}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={
                  async () => {
                    if (rewardList && rewardList.length == page_size) {
                      await fetchRewardList(rewardPageNumber + 1);
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
            <TableHead className="w-[100px]">Friend</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="">Reward</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow key={'-1default'}>
            <TableCell className="">-</TableCell>
            <TableCell
              className=" text-sm">#Invited</TableCell>
            <TableCell>Referral</TableCell>
            <TableCell>{getRefFriendsPoints()}</TableCell>
          </TableRow>
          {rewardList.map((action, index) => (
            <TableRow key={index}>
              <TableCell className="">{(rewardPageNumber - 1) * page_size + index + 1}</TableCell>
              <TableCell className=" text-sm">{action.tgUsername}</TableCell>
              <TableCell>{convertActionType(action.targetType)}</TableCell>
              <TableCell>{action.targetReward}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      {/*table end*/}


      {/*drawer*/}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-6 pb-20">
          {/*desc*/}
          <div>Will Open After Fair Mint Season!</div>
          {/*desc end*/}
        </DrawerContent>
      </Drawer>

      {/*drawer end*/}


      <div className="mt-20 mb-20 text-gray-600 text-center">&nbsp;</div>
      <div className="mt-20  text-gray-600 text-center">
        <Popover>
          <PopoverTrigger className="text-gray-400">A friend in need is a friend indeed.</PopoverTrigger>
          <PopoverContent
            className={'w-[300px] break-all'}>
            <div className={'break-all'}></div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex w-full flex-col pb-10">&nbsp;</div>
    </div>
  );
};

