"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Suspense, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/clientApp";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";

export type UserProfile = {
    hasCharacter: boolean;
    createdAt: number;
    displayName: string;
};

async function initUserProfile(displayName: string, uid: string): Promise<void> {
    const ref = doc(db, "users", uid);
    await setDoc(
        ref,
        { hasCharacter: false, createdAt: Date.now(), displayName: displayName } satisfies UserProfile,
        { merge: true }
    );
}

export function LoginInner() {
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailManipulated, setEmailManipulated] = useState(false);
    const [displayNameManipulated, setDisplayNameManipulated] = useState(false);
    const [passwordManipulated, setPasswordManipulated] = useState(false);
    const [confirmPasswordManipulated, setConfirmPasswordManipulated] = useState(false);
    const [errorLogin, setErrorLogin] = useState(false);
    const [errorSignUp, setErrorSignUp] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const showDisplayError = displayNameManipulated && displayName.trim() === "";
    const showEmailError = emailManipulated && email.trim() === "";
    const showPasswordError = passwordManipulated && password.trim() === "";
    const showConfirmPasswordError = confirmPasswordManipulated && (confirmPassword.trim() === "" || confirmPassword !== password);
    const validLogin = email.trim() !== "" && password.trim() !== "";
    const validSignUp = email.trim() !== "" && password.trim() !== "" && confirmPassword.trim() !== "" && (confirmPassword === password);

    const router = useRouter();
    const search = useSearchParams();
    const next = search.get("next") || "/play";

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            setAuthChecked(true);



            if (u) {

                try {
                    const snap = await getDoc(doc(db, "users", u.uid));
                    const profile = snap.data() as UserProfile | undefined;

                    if (!profile || !profile.hasCharacter) {
                        router.replace("/play?onboarding=1");
                    } else {
                        router.replace(next);
                    }
                } catch (error) {
                    console.error("Error checking user profile:", error);
                    router.replace(next);
                }
            }
        });
        return () => unsub();
    }, [next, router]);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setErrorLogin(false);

        } catch (error) {
            console.error("Login error:", error);
            setErrorLogin(true);
        }
    };

    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await initUserProfile(displayName, userCredential.user.uid);
            setErrorSignUp(false);

        } catch (error) {
            console.error("Sign up error:", error);
            setErrorSignUp(true);
        }
    };

    return (
        <div className="flex sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-[url('/hero.png')] bg-cover bg-center">
            <div className="flex flex-col justify-center items-center w-full">
                <Tabs defaultValue="login" className="w-[85%] sm:w-[55%] lg:w-[30%] xl:w-[20%] flex-none shrink-0">
                    <TabsList>
                        <TabsTrigger value="login" className="cursor-pointer">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="cursor-pointer">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
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
                                                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                                                <Input
                                                    id="login-email"
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
                                                <FieldLabel htmlFor="login-password">
                                                    Password
                                                    <CardAction className="flex w-full justify-end">
                                                        <Button variant="link" disabled>Forgot Password?</Button>
                                                    </CardAction>
                                                </FieldLabel>
                                                <Input
                                                    id="login-password"
                                                    type="password"
                                                    required
                                                    placeholder="password"
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onBlur={() => setPasswordManipulated(true)}
                                                />
                                                <FieldDescription className={showPasswordError ? "text-red-500" : "hidden"}>
                                                    Please enter your password.
                                                </FieldDescription>
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col justify-center">
                                <Button
                                    className="w-[50%] bg-amber-400 font-[800]"
                                    type="submit"
                                    onClick={handleLogin}
                                    disabled={!validLogin}
                                >
                                    Login
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="signup">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-[800] text-2xl">
                                    Sign Up for an account
                                </CardTitle>
                                <CardDescription className={errorSignUp ? "text-red-500" : "hidden"}>
                                    Error, please try again.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSignUp();
                                }}>
                                    <FieldSet>
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="signup-display">Username</FieldLabel>
                                                <Input
                                                    id="signup-display"
                                                    type="text"
                                                    required
                                                    placeholder="username"
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    onBlur={() => setDisplayNameManipulated(true)}
                                                />
                                                <FieldDescription className={showDisplayError ? "text-red-500" : "hidden"}>
                                                    Please enter a username.
                                                </FieldDescription>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                                                <Input
                                                    id="signup-email"
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
                                                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    required
                                                    placeholder="password"
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onBlur={() => setPasswordManipulated(true)}
                                                />
                                                <FieldDescription className={showPasswordError ? "text-red-500" : "hidden"}>
                                                    Please enter a valid password.
                                                </FieldDescription>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="signup-confirm-password">Confirm Password</FieldLabel>
                                                <Input
                                                    id="signup-confirm-password"
                                                    type="password"
                                                    required
                                                    placeholder="confirm password"
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    onBlur={() => setConfirmPasswordManipulated(true)}
                                                />
                                                <FieldDescription className={showConfirmPasswordError ? "text-red-500" : "hidden"}>
                                                    Passwords must match.
                                                </FieldDescription>
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col justify-center">
                                <Button
                                    className="w-[50%] bg-amber-400 font-[800]"
                                    type="button"
                                    onClick={handleSignUp}
                                    disabled={!validSignUp}
                                >
                                    Sign Up
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <LoginInner />
        </Suspense>
    );
}