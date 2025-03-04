"use client";
import axios from "axios";
import { use } from "react";
import { useEffect, useState } from "react";
import CurrentChatbox from "@/pages/chatting/chat";

export default function Page({ params }) {
  const [chatbot, setChatbot] = useState(null);
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const fetchChatBotData = async () => {
    try {
      const res = await axios.get(
        `https://chatbuilder-puce.vercel.app/api/chatbot/single/${slug}`
      );
      console.log(res);
      setChatbot(res.data.chatbot);
    } catch (error) {
      console.error("Error in fetching chatbot =>", error);
    }
  };

  useEffect(() => {
    fetchChatBotData();
  }, [slug]);

  return <>{chatbot && <CurrentChatbox chatId={slug} chatbot={chatbot} />}</>;
}
