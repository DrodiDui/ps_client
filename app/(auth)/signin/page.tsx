'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import {useAuth} from "@/context/AppAuthProvider"
import { useRouter } from "next/navigation"

import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {cn} from "@/lib/utils";
import {TokenResponse} from "@/type/AuthResponse";


const LoginSchema = z.object({
    username: z.string().min(5, "Минимальная длина логина - 5 символов"),
    password: z.string().min(6, 'Минимальная длина пароля - 6 символов')
});

const SignInPage = () => {

    const {login, token} = useAuth()
    const router = useRouter();

    const [tokenResponse, setTokenResponse] = useState<TokenResponse>()

    useEffect(() => {
        if (token) router.push("/");
    }, [token, router]);

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema)
    });


    const authenticate = async (data: z.infer<typeof LoginSchema>) => {
        try {
            const response = await fetch('http://localhost:10000/auth/v1/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ZGVtby1jbGllbnQ6ZGVtby1jbGllbnQ='
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    username: data.username,
                    password: data.password
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
                                <form onSubmit={form.handleSubmit(authenticate)} className='flex flex-col gap-4'>

                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Логин или Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Введите логин или email"
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

                                    <Button type="submit" className="w-full">
                                        Войти
                                    </Button>

                                    <Link
                                        href='/signup'
                                        className='flex justify-center text-gray-600 hover:text-primary transition-colors'
                                    >
                                        Создать аккаунт
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

export default SignInPage