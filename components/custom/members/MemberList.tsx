'use client'

import { useAuth } from "@/context/AppAuthProvider"
import { useWorkspace } from "@/context/WorkspaceProvider";
import { useEffect, useState } from "react";
import { MemberResponse } from "@/type/MemberResponse";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MemberListComponent = () => {
    const { token } = useAuth();
    const { currentWorkspace } = useWorkspace();
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const aggregatorPath = process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH;

    useEffect(() => {
        const loadMembers = async () => {
            const response = await fetch(`${baseUrl}${aggregatorPath}/members/available`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    workspaceId: `${currentWorkspace?.workspaceId}`,
                },
            });
            setMembers(await response.json());
        };
        loadMembers();
    }, []);

    // Функция для получения инициалов пользователя
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    // Функция для определения цвета статуса
    const getStatusColor = (statusCode: string) => {
        switch (statusCode) {
            case "ACTIVE":
                return "bg-green-100 text-green-800";
            case "INACTIVE":
                return "bg-red-100 text-red-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Функция для определения цвета роли
    const getRoleColor = (roleCode: string) => {
        switch (roleCode) {
            case "ADMIN":
                return "bg-purple-100 text-purple-800";
            case "MANAGER":
                return "bg-blue-100 text-blue-800";
            case "MEMBER":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Фильтрация участников по поисковому запросу
    const filteredMembers = members.filter((member) =>
        `${member.firstName} ${member.lastName} ${member.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Workspace Members</h2>
                <Button>Add Members</Button>
            </div>

            <div className="flex justify-between items-center">
                <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <div className="text-sm text-gray-500">
                    {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMembers.map((member) => (
                        <TableRow key={member.memberId}>
                            <TableCell className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={member.avatarUrl || ""} alt={member.firstName} />
                                    <AvatarFallback>
                                        {getInitials(member.firstName, member.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">
                                        {member.firstName} {member.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">@{member.username}</div>
                                </div>
                            </TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "px-2 py-1 rounded-full",
                                        getStatusColor(member.memberStatus.itemCode)
                                    )}
                                >
                                    {member.memberStatus.description}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "px-2 py-1 rounded-full",
                                        getRoleColor(member.memberRole.itemCode)
                                    )}
                                >
                                    {member.memberRole.description}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                    Manage
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default MemberListComponent;