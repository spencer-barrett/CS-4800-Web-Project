"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { use, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/clientApp";
import { onAuthStateChanged, User } from "firebase/auth";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useSearchParams, useRouter } from "next/navigation";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailManipulated, setEmailManipulated] = useState(false);
    const [passwordManipulated, setPasswordManipulated] = useState(false);
    const [confirmPasswordManipulated, setconfirmPasswordManipulated] = useState(false);
    const showEmailError = emailManipulated && email.trim() === "";
    const showPasswordError = passwordManipulated && password.trim() === "";
    const validLogin = email.trim() !== "" && password.trim() !== "";
    const [errorLogin, setErrorLogin] = useState(false);
    const [errorSignUp, setErrorSignUp] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const showConfirmPasswordError = confirmPasswordManipulated && (confirmPassword.trim() === "" || confirmPassword !== password);
    const validSignUp = email.trim() !== "" && password.trim() !== "" && confirmPassword.trim() !== "" && (confirmPassword === password);

    const router = useRouter();
    const search = useSearchParams();
    const next = search.get("next") || "/play";

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthChecked(true);
            if (u) router.replace(next);     // redirect only if already signed in
        });
        return () => unsub();
    }, [next, router]);


    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setErrorLogin(false);
            router.replace(next);
            // handle successful login here
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            // handle error here
            setErrorLogin(true);
        }
    };

    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user;
            setErrorSignUp(false);
            router.replace(next);
            // handle successful signup here
        } catch (error: any) {
            setErrorSignUp(true);
            console.log(error);

        }
    }


    return (
        <div className="flex sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-[url('/hero.png'))] bg-cover bg-center">
            <div className="flex flex-col justify-center items-center w-full">
                <Tabs defaultValue="login" className="w-[85%] sm:w-[55%] lg:w-[30%] xl:w-[20%] flex-none shrink-0">
                    <TabsList>
                        <TabsTrigger value="login" className="cursor-pointer">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="cursor-pointer">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card className="">
                            <CardHeader className="">
                                <CardTitle className="font-[800] text-2xl">
                                    Login to your account

                                </CardTitle>
                                <CardDescription className={errorLogin ? "text-red-500" : "hidden"}>
                                    Error, please try again.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleLogin();
                                }}>
                                    <FieldSet>
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    placeholder="email"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onBlur={() => setEmailManipulated(true)}
                                                />
                                                <FieldDescription className={showEmailError ? "text-red-500" : "hidden"}>
                                                    Please enter your email address.
                                                </FieldDescription>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="password">Password <CardAction className="flex w-full  justify-end">
                                                    <Button variant="link" disabled>Forgot Password?</Button>
                                                </CardAction></FieldLabel>
                                                <Input id="password" type="password" required placeholder="password" onChange={(e) => setPassword(e.target.value)} onBlur={() => setPasswordManipulated(true)} />
                                                <FieldDescription className={showPasswordError ? "text-red-500" : "hidden"}>
                                                    Please enter your password.
                                                </FieldDescription>
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col justify-center">
                                <Button className="w-[50%] bg-amber-400 font-[800] " type="submit" onClick={handleLogin} disabled={!validLogin}>Login</Button>

                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="signup">
                        <Card className="">
                            <CardHeader className="">
                                <CardTitle className="font-[800] text-2xl">
                                    Sign Up for an account

                                </CardTitle>
                                <CardDescription className={errorSignUp ? "text-red-500" : "hidden"}>
                                    Error, please try again.                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSignUp();
                                }}>
                                    <FieldSet>
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    placeholder="email"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onBlur={() => setEmailManipulated(true)}
                                                />
                                                <FieldDescription className={showEmailError ? "text-red-500" : "hidden"}>
                                                    Please enter an email address.
                                                </FieldDescription>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                                <Input id="password" type="password" required placeholder="password" onChange={(e) => setPassword(e.target.value)} onBlur={() => setPasswordManipulated(true)} />
                                                <FieldDescription className={showPasswordError ? "text-red-500" : "hidden"}>
                                                    Please enter a valid password.
                                                </FieldDescription>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="password">Confirm Password</FieldLabel>
                                                <Input id="password" type="password" required placeholder="confirm password" onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => setconfirmPasswordManipulated(true)} />
                                                <FieldDescription className={showConfirmPasswordError ? "text-red-500" : "hidden"}>
                                                    Passwords must match.
                                                </FieldDescription>
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col justify-center">
                                <Button className="w-[50%] bg-amber-400 font-[800]" type="button" onClick={handleSignUp} disabled={!validSignUp}>Sign Up</Button>

                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}