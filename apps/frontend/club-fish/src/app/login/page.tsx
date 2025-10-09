"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    return (
        <div className="flex sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-[url('/hero.png'))] bg-cover bg-center">
            <div className="flex flex-col justify-center items-center w-full">
                <Card className="w-[85%] sm:w-[55%] lg:w-[30%] xl:w-[20%] flex-none shrink-0">
                    <CardHeader className="">
                        <CardTitle className="font-[800] text-2xl">
                            Login to your account

                        </CardTitle>
                        {/* <CardDescription>
                           
                        </CardDescription> */}
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input id="email" type="email" required placeholder="email" />
                                    <FieldDescription>
                                        Please enter your email address.
                                    </FieldDescription>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="password">Password <CardAction className="flex w-full  justify-end">
                                        <Button variant="link">Forgot Password?</Button>
                                    </CardAction></FieldLabel>
                                    <Input id="password" type="password" required placeholder="password" />
                                    <FieldDescription>
                                        Please enter your password.
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </FieldSet>

                    </CardContent>
                    <CardFooter className="flex flex-col justify-center">

                        <Button className="w-[50%] bg-amber-400 font-[800]">Login</Button>
                         <CardAction className="flex w-full  justify-center pt-4">
                                <Button variant="outline" className="w-[50%] font-[800]">Sign Up</Button>
                            </CardAction>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}