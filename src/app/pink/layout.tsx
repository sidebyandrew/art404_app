'use client';
import React from "react";
import Header404 from "@/components/header404";

export default function AboutLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <section>
            <Header404/>
            {children}
        </section>
    );
}
