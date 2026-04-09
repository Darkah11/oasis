"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { format } from "date-fns";
import {
  addMessage,
  setMessages,
  upsertMessages,
  updateLastSync,
  setActiveChat,
  updateMessageStatus,
  updateMessage,
} from "@/store/slices/chatSlice";
import { useSocket } from "@/hooks/useSocket";
import axios from "axios";
import {
  Settings,
  Users,
  MessageSquare,
  CircleDashed,
  Circle,
  CircleCheck,
  CircleAlert,
  RefreshCw,
  Menu,
  Search,
  Phone,
  Paperclip,
  Smile,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SocketStatus } from "../SocketStatus";
import { Message } from "@/types/Message";

interface ChatAreaProps {
  toggleMobileMenu: () => void;
  onStartCall?: () => void;
}

export default function ChatArea({
  toggleMobileMenu,
  onStartCall,
}: ChatAreaProps) {
  const activeChatId = useSelector(
    (state: RootState) => state.chat.activeChatId,
  );
  const chats = useSelector((state: RootState) => state.chat.chats);
  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = useSelector((state: RootState) =>
    activeChatId ? state.chat.messages[activeChatId] || [] : [],
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const lastSyncs = useSelector((state: RootState) => state.chat.lastSyncs || {});
  const dispatch = useDispatch();
  const { sendMessage } = useSocket();

  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredChats = chats.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMessages = messages.filter((m) =>
    m.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatId || !token) return;

      const lastSync = lastSyncs[activeChatId] || 0;
      const now = Date.now();
      const needsSync = now - lastSync > 5 * 60 * 1000; // 5 minutes threshold
      const isFirstLoad = messages.length === 0;

      if (!isFirstLoad && !needsSync) {
        console.log("Using cached messages, sync not needed yet.");
        return;
      }

      setIsSyncing(true);
      try {
        // If we have messages, only fetch those after the last message timestamp
        const lastMessage = messages[messages.length - 1];
        const afterUrl = lastMessage?.createdAt 
          ? `?after=${encodeURIComponent(lastMessage.createdAt)}` 
          : "";

        console.log(`Syncing messages for ${activeChatId}...`, afterUrl ? " (incremental)" : " (full)");
        
        const response = await axios.get(
          `/api/chats/${activeChatId}/messages${afterUrl}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const newMessages = response.data.messages;

        if (newMessages.length > 0) {
          if (isFirstLoad) {
            dispatch(
              setMessages({
                chatId: activeChatId,
                messages: newMessages,
              }),
            );
          } else {
            dispatch(
              upsertMessages({
                chatId: activeChatId,
                messages: newMessages,
              }),
            );
          }
        }
        
        dispatch(updateLastSync(activeChatId));
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchMessages();
  }, [activeChatId, token, dispatch]);
// Note: lastSyncs is omitted to avoid infinite loop when updating lastSync

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // const handleSendMessage = async () => {
  //   if (!message.trim() || !activeChatId || !token) return;

  //   try {
  //     const content = message;
  //     setMessage('');

  //     const response = await axios.post(`/api/chats/${activeChatId}/messages`, {
  //       content,
  //     }, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const newMessage = response.data.message;
  //     dispatch(addMessage({ chatId: activeChatId, message: newMessage }));

  //     const receiver = activeChat?.participants?.find((p: any) => {
  //       const pId = typeof p === 'string' ? p : (p._id || p.id);
  //       const currentUserId = user?.id || (user as any)?._id;
  //       return pId !== currentUserId;
  //     });
  //     const receiverId = typeof receiver === 'string' ? receiver : (receiver as any)?._id || (receiver as any)?.id;

  //     if (receiverId) {
  //       sendMessage(receiverId, newMessage);
  //     }
  //   } catch (error) {
  //     console.error('Failed to send message:', error);
  //   }
  // };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChatId || !token || !user) {
      console.error("Message empty or missing data");
      return;
    }

    const content = message;
    setMessage("");

    const tempId = `temp-${Date.now()}`;

    const receiver: any = activeChat?.participants?.find((p: any) => {
      const pId = String(p._id || p.id || p);
      const currentUserId = String(user?.id || (user as any)?._id);
      console.log(
        `Checking participant ${pId} against current user ${currentUserId}`,
      );
      return pId !== currentUserId;
    });

    const receiverId = receiver ? receiver._id : undefined;

    const optimisticMessage: Message = {
      id: tempId,
      content,
      senderId: user.id,
      chatId: activeChatId,
      status: "sending",
      type: "text",
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessage({ chatId: activeChatId, message: optimisticMessage }));

    console.log("🔄 Sending message...");
    console.log("Active Chat ID:", activeChatId);
    console.log("Receiver ID:", receiverId);

    try {
      const response = await axios.post(
        `/api/chats/${activeChatId}/messages`,
        {
          content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const savedMessage = response.data.message;
      console.log("✅ Message saved to DB:", savedMessage);

      // Add to Redux store (shows immediately for sender)
      // dispatch(addMessage({ chatId: activeChatId, message: newMessage }));
      dispatch(
        updateMessage({
          chatId: activeChatId,
          tempId,
          newMessage: { ...savedMessage, status: "sent" },
        }),
      );

      // Send via Socket.io (for real-time to receiver)
      if (receiverId) {
        console.log("📡 Emitting message via socket...");
        sendMessage(receiverId, savedMessage);
      } else {
        console.warn("⚠️ No receiver ID found");
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      dispatch(
        updateMessageStatus({
          chatId: activeChatId,
          messageId: tempId,
          status: "failed",
        }),
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0d0d] relative">
      {/* Search Header Wrapper */}
      <div className="p-4 border-b border-[#222] bg-[#0d0d0d] z-30">
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-2xl font-black tracking-tight hidden sm:block">
              {activeChat?.name || "Oasis Chat"}
            </h1>
          </div>
          <SocketStatus />
          <div className="flex-2 relative">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold-200 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search users or messages..."
                className="w-full bg-[#151515] border border-transparent focus:border-gold-200/50 focus:outline-none rounded-2xl py-2.5 pl-12 pr-4 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Local Search Results Dropdown */}
            {searchTerm.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto no-scrollbar">
                {filteredChats.length > 0 && (
                  <>
                    <div className="p-2 border-b border-[#333] text-[10px] uppercase tracking-widest text-zinc-500 px-4 font-bold bg-[#151515]">
                      Contacts
                    </div>
                    {filteredChats.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          dispatch(setActiveChat(c.id));
                          setSearchTerm("");
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#222] transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gold-200/20 flex items-center justify-center text-gold-200 font-bold text-xs">
                          {c.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{c.name}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {filteredMessages.length > 0 && (
                  <>
                    <div className="p-2 border-b border-[#333] text-[10px] uppercase tracking-widest text-zinc-500 px-4 font-bold bg-[#151515]">
                      Messages
                    </div>
                    {filteredMessages.map((m, i) => (
                      <div
                        key={i}
                        className="w-full flex flex-col gap-1 p-3 hover:bg-[#222] transition-colors text-left border-b border-[#222] last:border-0"
                      >
                        <p className="text-xs text-zinc-400 font-bold">
                          {m.senderId === user?.id ? "You" : activeChat?.name}
                        </p>
                        <p className="text-sm text-white line-clamp-1">
                          {m.content}
                        </p>
                      </div>
                    ))}
                  </>
                )}

                {filteredChats.length === 0 &&
                  filteredMessages.length === 0 && (
                    <div className="p-8 text-center text-zinc-600 italic text-sm">
                      No matching contacts or messages
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isSyncing && (
              <RefreshCw size={16} className="text-gold-200 animate-spin mr-2" />
            )}
            <button
              onClick={onStartCall}
              className="p-2.5 hover:bg-zinc-800 rounded-xl text-zinc-400 transition-all"
              title="Start Call"
            >
              <Phone size={20} />
            </button>
            <button className="p-2.5 hover:bg-zinc-800 rounded-xl text-zinc-400 transition-all">
              <Settings size={20} />
            </button>
            <button className="p-2.5 hover:bg-zinc-800 rounded-xl text-green-500 relative transition-all">
              <div className="w-2 h-2 bg-green-500 rounded-full absolute top-2 right-2 border-2 border-[#0d0d0d]" />
              <Users size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[#333] p-0.5 ml-2 cursor-pointer overflow-hidden">
              <div className="w-full h-full rounded-full bg-gold-200 flex items-center justify-center text-[#0d0d0d] font-bold text-xs">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeChatId ? (
        <>
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col pt-4">
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 space-y-6 pb-8"
            >
              <div className="flex justify-center mb-8">
                <span className="bg-[#1a1a1a] text-zinc-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#222]">
                  {messages[0]?.createdAt
                    ? format(new Date(messages[0].createdAt), "d MMM yyyy")
                    : "Today"}
                </span>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <MessageSquare size={64} className="mb-4" />
                  <p className="text-xl font-black italic">
                    Start the conversation
                  </p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex w-full group",
                      isMe ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "flex gap-4 max-w-[80%] min-w-0",
                        isMe && "flex-row-reverse",
                      )}
                    >
                      {!isMe && (
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-500 shrink-0 mt-1">
                          {activeChat?.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        {/* <div
                          className={cn(
                            "flex items-center gap-2 ",
                            isMe && "flex-row-reverse",
                          )}
                        >
                          <span className="text-xs font-bold text-zinc-400 hidden group-hover:block transition-all">
                            {isMe ? "You" : activeChat?.name}
                          </span>
                         
                        </div> */}
                        <div
                          className={cn(
                            "relative min-w-[100px] px-2 pt-[5px] pb-[13px] rounded-[10px] text-sm leading-relaxed shadow-sm break-all whitespace-pre-wrap",
                            isMe
                              ? "bg-gold-200 text-[#0d0d0d] rounded-tr-[2px] font-medium"
                              : "bg-[#1a1a1a] text-[#eee] rounded-tl-[2px] border border-[#222]",
                          )}
                        >
                          {msg.content}
                          <span className=" flex items-center gap-1 absolute bottom-0 right-2 text-[10px] text-zinc-600 font-medium ">
                            {msg.createdAt
                              ? format(new Date(msg.createdAt), "h:mm a")
                              : "Now"}
                            {isMe && msg.status === "sending" && (
                              <CircleDashed
                                size={12}
                                className="animate-spin"
                              />
                            )}
                            {isMe && msg.status === "sent" && <CircleCheck size={12} />}
                            {isMe && msg.status === "delivered" && (
                              <CircleCheck size={12} />
                            )}
                            {isMe && msg.status === "read" && (
                              <Circle size={12} className="animate-spin" />
                            )}
                            {isMe && msg.status === "failed" && (
                              <CircleAlert size={12} className=" text-red-600" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-[#0d0d0d] z-20">
              <div className="max-w-4xl mx-auto flex items-center gap-4 bg-[#151515] p-2 rounded-[28px] border border-[#222] focus-within:border-gold-200/30 transition-all shadow-2xl">
                <button className="p-3 text-zinc-500 hover:text-white transition-colors">
                  <Paperclip size={22} />
                </button>
                <input
                  type="text"
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-[#eee]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <div className="flex items-center gap-2">
                  <button className="p-3 text-zinc-500 hover:text-gold-200 transition-colors">
                    <Smile size={22} />
                  </button>
                  <button
                    className={cn(
                      "p-3 rounded-full transition-all flex items-center justify-center",
                      message.trim()
                        ? "bg-gold-200 text-[#0d0d0d] scale-100"
                        : "bg-transparent text-zinc-600",
                    )}
                    onClick={handleSendMessage}
                  >
                    <Send
                      size={20}
                      className={cn(
                        message.trim() && "translate-x-0.5 -translate-y-0.5",
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-[32px] bg-[#151515] flex items-center justify-center text-gold-200 shadow-2xl rotate-3 mb-8 border border-[#222]">
            <MessageSquare size={40} className="-rotate-3" />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tighter italic">
            CHOOSE YOUR OASIS
          </h1>
          <p className="text-zinc-500 max-w-sm mb-8">
            Select a conversation from the sidebar or search for someone new to
            start dynamic, premium messaging.
          </p>
          <div className="flex gap-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden px-8 py-3 bg-gold-200 text-[#0d0d0d] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              View Chats
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
