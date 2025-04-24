"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, ArrowLeft } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";

type ViewState = "button" | "input" | "chat" | "cards";
type Message = {
    role: "user" | "assistant";
    content: string;
};

type UserStoryCard = {
    id: string;
    title: string;
    content: string;
};

export function OneButtonLinear() {
    const [viewState, setViewState] = useState<ViewState>("button");
    const [command, setCommand] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [markdownContent, setMarkdownContent] = useState("");
    const [userStories, setUserStories] = useState<UserStoryCard[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = () => {
        if (viewState !== "button") {
            setViewState("button");
        }
    };

    useOnClickOutside(containerRef as React.RefObject<HTMLElement>, handleClickOutside);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && viewState !== "button") {
                setViewState("button");
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [viewState]);

    const handleButtonClick = () => {
        setViewState("input");
    };

    const handleInputSubmit = () => {
        setViewState("chat");
        const newMessage: Message = {
            role: "user",
            content: command
        };
        setMessages([...messages, newMessage]);
        // TODO: Add AI integration here to generate markdown content
        setMarkdownContent(`# User Story: ${command}\n\n## Description\n\nThis is a placeholder for the AI-generated user story.`);
    };

    const handleMarkdownEdit = (content: string) => {
        setMarkdownContent(content);
    };

    const parseStoriesFromMarkdown = (content: string): UserStoryCard[] => {
        // Split content by "##" to separate stories
        const storySections = content.split(/##\s+/).filter(section => section.trim());

        return storySections.map((section, index) => {
            // Extract title (first line after #)
            const titleMatch = section.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : `Story ${index + 1}`;

            // Remove the title line to get the content
            const content = section.replace(/^#\s+.+$/m, '').trim();

            return {
                id: Date.now().toString() + index,
                title,
                content
            };
        });
    };

    const handleSubmit = () => {
        const stories = parseStoriesFromMarkdown(markdownContent);
        setUserStories(stories);
        setViewState("cards");
    };

    const Footer = ({ onBack, onSubmit }: { onBack: () => void; onSubmit?: () => void }) => (
        <div className="flex justify-between items-center p-4 border-t">
            <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="mr-2" size={16} />
                Back
            </Button>
            {onSubmit && (
                <Button onClick={onSubmit}>
                    Submit
                </Button>
            )}
        </div>
    );

    const currentView = useMemo(() => {
        const containerClasses = "max-w-4xl mx-auto w-full h-[600px] bg-[#FDFDFC] rounded-lg shadow-lg overflow-hidden flex flex-col";

        switch (viewState) {
            case "button":
                return (
                    <motion.button
                        layoutId='card-wrapper'
                        onClick={handleButtonClick}
                        className="border rounded-lg px-4 py-2 bg-white"
                    >
                        <span className="text-sm font-medium">feedback</span>
                    </motion.button>
                );
            case "input":
                return (
                    <motion.div
                        ref={containerRef}
                        className="absolute w-[364px] p-2 border rounded-lg bg-white flex items-center gap-2"
                        layoutId='card-wrapper'
                    >
                        <Input
                            placeholder="Type your command..."
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            className="flex-1 bg-transparent"
                        />
                        <button onClick={handleInputSubmit} className="px-3 py-1 rounded-md bg-blue-500 text-white">
                            <span>Generate</span>
                        </button>
                    </motion.div>
                );
            case "chat":
                return (
                    <motion.div
                        ref={containerRef}
                        layoutId='card-wrapper'
                        className="absolute w-[800px] h-[600px] border rounded-lg bg-white shadow-lg overflow-hidden flex flex-col"
                    >
                        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
                            <Card className="p-4 flex flex-col">
                                <h2 className="text-xl font-bold mb-4">Chat</h2>
                                <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-3 rounded-lg ${message.role === "user"
                                                ? "bg-blue-100 ml-auto max-w-[80%]"
                                                : "bg-gray-100 mr-auto max-w-[80%]"
                                                }`}
                                        >
                                            {message.content}
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="relative">
                                    <Input
                                        placeholder="Type your command..."
                                        value={command}
                                        onChange={(e) => setCommand(e.target.value)}
                                        className="pr-12"
                                    />
                                    <Button
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                        onClick={handleInputSubmit}
                                    >
                                        <motion.div>
                                            <ArrowUp size={16} weight="bold" />
                                        </motion.div>
                                    </Button>
                                </div>
                            </Card>
                            <Card className="p-4 flex flex-col">
                                <h2 className="text-xl font-bold mb-4">Editor</h2>
                                <div className="flex-1 overflow-y-auto">
                                    <Textarea
                                        value={markdownContent}
                                        onChange={(e) => handleMarkdownEdit(e.target.value)}
                                        className="h-full min-h-[300px] font-mono"
                                    />
                                </div>
                            </Card>
                        </div>
                        <Footer onBack={() => setViewState("input")} onSubmit={handleSubmit} />
                    </motion.div>
                );
            case "cards":
                return (
                    <motion.div
                        ref={containerRef}
                        layoutId='card-wrapper'
                        className="absolute w-[800px] h-[600px] border rounded-lg bg-white shadow-lg overflow-hidden flex flex-col"
                    >
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-4">
                                {userStories.map((story, index) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="p-4">
                                            <h3 className="text-lg font-bold mb-2">{story.title}</h3>
                                            <div className="prose max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {story.content}
                                                </ReactMarkdown>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <Footer onBack={() => setViewState("chat")} />
                    </motion.div>
                );
            default:
                return null;
        }
    }, [viewState, command, messages, markdownContent, userStories, handleButtonClick, handleInputSubmit, handleMarkdownEdit]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#FDFDFC]" >
            <div className="relative h-[700px] flex items-center justify-center w-full">
                <AnimatePresence>
                    {currentView}
                </AnimatePresence>
            </div>
        </div >
    );
}