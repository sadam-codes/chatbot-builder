import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Code blocks with syntax highlighting
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        return !inline && match ? (
                            <div className="my-4 rounded-lg overflow-hidden">
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={language}
                                    PreTag="div"
                                    className="!m-0 rounded-lg"
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                    }}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded text-sm font-mono"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    // Headings
                    h1: ({ node, ...props }: any) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4  " {...props} />
                    ),
                    h2: ({ node, ...props }: any) => (
                        <h2 className="text-xl font-bold mt-5 mb-3  " {...props} />
                    ),
                    h3: ({ node, ...props }: any) => (
                        <h3 className="text-lg font-bold mt-4 mb-2  " {...props} />
                    ),
                    // Paragraphs
                    p: ({ node, ...props }: any) => (
                        <p className="mb-4  leading-relaxed" {...props} />
                    ),
                    // Lists
                    ul: ({ node, ...props }: any) => (
                        <ul className="list-disc mb-4 space-y-1 " {...props} />
                    ),
                    ol: ({ node, ...props }: any) => (
                        <ol className="list-decimal mb-4 space-y-1 " {...props} />
                    ),
                    li: ({ node, ...props }: any) => (
                        <li className="ml-4 text-black" {...props} />
                    ),
                    // Links
                    a: ({ node, ...props }: any) => (
                        <a
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),
                    // Blockquotes
                    blockquote: ({ node, ...props }: any) => (
                        <blockquote
                            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-700 dark:text-gray-300"
                            {...props}
                        />
                    ),
                    // Tables
                    table: ({ node, ...props }: any) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }: any) => (
                        <th
                            className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left"
                            {...props}
                        />
                    ),
                    td: ({ node, ...props }: any) => (
                        <td
                            className="border border-gray-300 dark:border-gray-600 px-4 py-2"
                            {...props}
                        />
                    ),
                    // Horizontal rule
                    hr: ({ node, ...props }: any) => (
                        <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
                    ),
                    // Strong/Bold
                    strong: ({ node, ...props }: any) => (
                        <strong className="font-semibold  " {...props} />
                    ),
                    // Emphasis/Italic
                    em: ({ node, ...props }: any) => (
                        <em className="italic" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;

