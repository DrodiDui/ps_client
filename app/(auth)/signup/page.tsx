'use client'

import {z} from "zod";
import {useEffect, useState} from "react";
import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";
import {TokenResponse} from "@/type/AuthResponse";
import {useAuth} from "@/context/AppAuthProvider";
import {useRouter} from "next/navigation";
import {MemberResponse} from "@/type/MemberResponse";
import {cn} from "@/lib/utils";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import * as React from "react";

const RegistrationSchema = z.object({
    username: z.string().min(5, "Минимальная длина логина - 5 символов"),
    email: z.string().min(5, 'Минимальная длина email - 5 символов'),
    password: z.string().min(6, 'Минимальная длина пароля - 6 символов'),
    firstName: z.string(),
    lastName: z.string(),
    middleName: z.string().optional(),
    memberPosition: z.string()
});

const SignUpPage = () => {

    const {login, token} = useAuth()
    const router = useRouter();

    const basicToken = process.env.NEXT_PUBLIC_BASIC_TOKEN
    const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL
    const referencePath = process.env.NEXT_PUBLIC_REFERENCE_SERVICE_PATH
    const userManagerPath = process.env.NEXT_PUBLIC_USER_SERVICE_PATH

    const [memberPosition, setMemberPosition] = useState<ReferenceItemResponse[]>([])
    const [tokenResponse, setTokenResponse] = useState<TokenResponse>()
    const [member, setMember] = useState<MemberResponse>()

    const form = useForm<z.infer<typeof RegistrationSchema>>({
        resolver: zodResolver(RegistrationSchema)
    });


    useEffect(() => {
        const loadMemberPosition = async () => {
            const response = await fetch(`${baseUrl}${referencePath}/references/items?referenceType=MEMBER_POSITION`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${basicToken}`
                }
            })
            setMemberPosition(await response.json())
        }
        loadMemberPosition()
    }, []);


    const registration = async (data: z.infer<typeof RegistrationSchema>) => {
        try {
            const response = await fetch(`${baseUrl}${userManagerPath}/registration/self`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${basicToken}`
                },
                body: JSON.stringify(data)
            })
            let responseData = await response.json() as MemberResponse
            setMember(responseData)
        } catch (error) {

        }

        if (member) {
           authenticate(member?.username, data.password)
        }

    }

    const authenticate = async (username:string, password: string) => {
        try {
            const response = await fetch('http://localhost:10000/auth/v1/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicToken}`
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    username: username,
                    password: password
                })
            })
            let responseData = await response.json() as TokenResponse
            setTokenResponse(responseData)
        } catch (error) {

        }

        if (tokenResponse) {
            login(tokenResponse.tokenId, tokenResponse.userId)
            router.push('/')
        }

    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={cn("flex flex-col gap-6")}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Вход</CardTitle>
                            <CardDescription>
                                Введите данные для авторизации
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(registration)} className='flex flex-col gap-4'>

                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Логин</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Введите логин"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Введите email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Пароль</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Введите пароль"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Введите name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>last name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="last name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="middleName"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>middle name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="middle name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="memberPosition"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Позиция</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Выберите позицию"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {memberPosition.map((item) => (
                                                            <SelectItem key={item.itemCode}
                                                                        value={item.itemCode}>
                                                                {item.description}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full">
                                        Create account
                                    </Button>

                                    <Link
                                        href='/signin'
                                        className='flex justify-center text-gray-600 hover:text-primary transition-colors'
                                    >
                                        Войти
                                    </Link>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage