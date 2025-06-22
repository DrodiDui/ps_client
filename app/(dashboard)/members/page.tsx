'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {MemberResponse} from "@/type/MemberResponse";
import {useEffect, useState} from "react";
import {Mail} from "lucide-react";

const memberItems: MemberResponse[] = [
    {
        memberId: 1,
        username: 'boris.kapitonov.99',
        email: 'boris.kapitonov.99@gmail.com',
        firstName: 'Boris',
        lastName: 'Kapitonov',
        middleName: null
    },
    {
        memberId: 2,
        username: 'boris.kapitonov.99',
        email: 'boris.kapitonov.99@gmail.com',
        firstName: 'Boris',
        lastName: 'Kapitonov',
        middleName: null
    },
    {
        memberId: 3,
        username: 'boris.kapitonov.99',
        email: 'boris.kapitonov.99@gmail.com',
        firstName: 'Boris',
        lastName: 'Kapitonov',
        middleName: null
    }
]

const MembersPage = () => {

    const [members, setMembers] = useState<MemberResponse[]>([])

    useEffect(() => {
        setMembers(memberItems)
    }, []);

    return (
        <div className={'flex flex-col'}>
            <div className={'flex justify-end'}>Add members</div>
            <div>
                <Table>
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.memberId}>
                                <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                                <TableCell>{member.username}</TableCell>
                                <TableCell><Mail/></TableCell>
                                <TableCell className="text-right">Role</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default MembersPage