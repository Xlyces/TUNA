import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { db, realtimeDb } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { ref, onValue, push, off } from "firebase/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export default function ChatPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const bookingId = params.bookingId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !bookingId) {
      navigate("/login");
      return;
    }

    // Fetch booking details
    const fetchBooking = async () => {
      try {
        const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
        if (!bookingDoc.exists()) {
          navigate("/bookings");
          return;
        }

        const bookingData = bookingDoc.data();
        
        // Check authorization
        if (bookingData.parentId !== user.uid && bookingData.tutorId !== user.uid) {
          navigate("/bookings");
          return;
        }

        setBooking(bookingData);
      } catch (error) {
        console.error("Error fetching booking:", error);
        navigate("/bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();

    // Set up real-time listener for messages
    const messagesRef = ref(realtimeDb, `chats/${bookingId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList: Message[] = Object.entries(messagesData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        messagesList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });

    return () => {
      off(messagesRef);
      unsubscribe();
    };
  }, [user, bookingId, navigate]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !userProfile) return;

    try {
      const messagesRef = ref(realtimeDb, `chats/${bookingId}/messages`);
      await push(messagesRef, {
        senderId: user.uid,
        senderName: userProfile.name || "User",
        text: messageText.trim(),
        timestamp: Date.now(),
      });

      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading chat..." />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const otherPartyName = userProfile?.role === "parent" 
    ? booking.tutorName || "Tutor"
    : booking.studentName || "Student";

  return (
    <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
      <PageHeader
        title={`Chat with ${otherPartyName}`}
        description={`Booking: ${booking.subject || "Lesson"}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Bookings", href: "/bookings" },
          { label: "Chat" },
        ]}
      />

      <Card className="flex-1 flex flex-col mt-4">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === user?.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(message.timestamp), "HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

