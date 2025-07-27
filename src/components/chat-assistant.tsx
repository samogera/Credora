
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { chat, ChatInput } from "@/ai/flows/chat";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        
        const chatHistory = messages.map(msg => ({
            role: msg.role,
            content: [{ text: msg.content }]
        }));

        const chatInput: ChatInput = {
            history: chatHistory,
            message: input
        };

        try {
            const result = await chat(chatInput);
            const modelMessage: Message = { role: 'model', content: result.message };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="primary"
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                className="w-[400px] h-[600px] p-0 rounded-lg shadow-2xl mr-4 mb-2 flex flex-col"
            >
                <Card className="h-full w-full flex flex-col border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                             <Avatar>
                                <AvatarFallback>
                                    <Bot />
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-lg">Credora Assistant</CardTitle>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                         </Button>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-3 text-sm",
                                        message.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {message.role === 'model' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><Bot size={18}/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "rounded-lg px-3 py-2 max-w-xs",
                                        message.role === 'user'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}>
                                        {message.content}
                                    </div>
                                     {message.role === 'user' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><User size={18}/></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center justify-start gap-2">
                                     <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot size={18}/></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse delay-0"></span>
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse delay-150"></span>
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse delay-300"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <CardFooter className="p-4 border-t">
                        <div className="flex w-full items-center space-x-2">
                            <Input
                                id="message"
                                placeholder="Type your message..."
                                className="flex-1"
                                autoComplete="off"
                                value={input}
                                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} onClick={handleSend}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
