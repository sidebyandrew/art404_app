'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Page({ params }: { params: { lang: string } }) {

  const router = useRouter();
  return (

    <div>
      <h1>Pink</h1>
      <Button className="flex ml-auto"
              onClick={() => {
                router.push('/pink/order_form');
              }}
      >order_form</Button>
    </div>
  );
}
