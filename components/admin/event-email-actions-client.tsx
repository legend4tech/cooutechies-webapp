/**
 * Event Email Actions Client Component
 * Handles email sending with TanStack Query mutations
 * Disables reminders for past events
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mail, Bell, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useSendAnnouncement,
  useSendReminder,
} from "@/hooks/tanstack-query/use-event-details";

type TimeFrame = "1-week" | "3-days" | "tomorrow" | "today";

interface EventEmailActionsClientProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventDescription: string;
  eventThumbnail?: string;
  announcementSent: boolean;
  registrations: Array<{ email: string; name: string }>;
  allCommunityEmails: string[];
  sentReminders: Record<TimeFrame, boolean>;
  eventIsPast: boolean;
  eventDateISO: string;
  eventDuration?: string;
}

export function EventEmailActionsClient({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  eventDescription,
  eventThumbnail,
  announcementSent,
  registrations,
  allCommunityEmails,
  sentReminders: initialSentReminders,
  eventIsPast,
}: EventEmailActionsClientProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<TimeFrame>("1-week");
  const [sentReminders, setSentReminders] =
    useState<Record<TimeFrame, boolean>>(initialSentReminders);

  // Mutations
  const sendAnnouncementMutation = useSendAnnouncement(eventId);
  const sendReminderMutation = useSendReminder(eventId);

  const handleSendAnnouncement = async () => {
    try {
      const result = await sendAnnouncementMutation.mutateAsync({
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        location: eventLocation,
        thumbnail: eventThumbnail,
      });

      if (result.success) {
        toast.success("Success", {
          description: result.message,
        });
      } else {
        toast.error("Error", {
          description: result.error || result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send announcement",
      });
    }
  };

  const handleSendReminder = async () => {
    try {
      const result = await sendReminderMutation.mutateAsync({
        recipients: registrations,
        eventData: {
          title: eventTitle,
          date: eventDate,
          location: eventLocation,
        },
        timeFrame: selectedTimeFrame,
      });

      if (result.success) {
        toast.success("Success", {
          description: result.message,
        });
        setSentReminders((prev) => ({
          ...prev,
          [selectedTimeFrame]: true,
        }));
      } else {
        toast.error("Error", {
          description: result.error || result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send reminder",
      });
    }
  };

  const timeFrameLabels: Record<TimeFrame, string> = {
    "1-week": "1 Week Before",
    "3-days": "3 Days Before",
    tomorrow: "Tomorrow",
    today: "Today",
  };

  return (
    <div className="space-y-4">
      {/* Event Announcement */}
      <Card className="border border-border/50 bg-linear-to-br from-primary/5 via-background/50 to-background/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Event Announcement
              </CardTitle>
              <CardDescription>
                Send announcement to all community members
              </CardDescription>
            </div>
            {announcementSent && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Sent
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {allCommunityEmails.length} community member
              {allCommunityEmails.length !== 1 ? "s" : ""} will receive this
              announcement.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={
                    announcementSent || sendAnnouncementMutation.isPending
                  }
                  className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {sendAnnouncementMutation.isPending
                    ? "Sending..."
                    : announcementSent
                    ? "Announcement Already Sent"
                    : "Send Announcement"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Confirm Announcement Send
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will send an announcement email to{" "}
                    {allCommunityEmails.length} community member
                    {allCommunityEmails.length !== 1 ? "s" : ""}. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-background/50 border border-border/50 rounded-lg p-4 my-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    {eventTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">{eventDate}</p>
                </div>
                <div className="flex gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSendAnnouncement}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Send Announcement
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Event Reminder */}
      <Card className="border border-border/50 bg-linear-to-br from-secondary/5 via-background/50 to-background/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-secondary" />
                Event Reminder
              </CardTitle>
              <CardDescription>
                Send reminder to registered attendees
              </CardDescription>
            </div>
            {eventIsPast && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Event Ended
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventIsPast ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Reminders Disabled
                </p>
                <p className="text-xs text-muted-foreground">
                  This event has already ended. Reminders can only be sent for
                  upcoming events.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {registrations.length} registered attendee
                  {registrations.length !== 1 ? "s" : ""} will receive this
                  reminder.
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Time Frame
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["1-week", "3-days", "tomorrow", "today"] as const).map(
                      (timeFrame) => {
                        const isSent = sentReminders[timeFrame];
                        return (
                          <button
                            key={timeFrame}
                            onClick={() =>
                              !isSent && setSelectedTimeFrame(timeFrame)
                            }
                            disabled={isSent}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border relative ${
                              isSent
                                ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400 cursor-not-allowed"
                                : selectedTimeFrame === timeFrame
                                ? "bg-secondary/20 border-secondary/50 text-secondary"
                                : "bg-background/50 border-border/50 text-muted-foreground hover:border-secondary/30"
                            }`}
                          >
                            <span className={isSent ? "opacity-70" : ""}>
                              {timeFrameLabels[timeFrame]}
                            </span>
                            {isSent && (
                              <CheckCircle2 className="h-3.5 w-3.5 absolute top-1.5 right-1.5 text-green-600 dark:text-green-400" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={
                        registrations.length === 0 ||
                        sendReminderMutation.isPending ||
                        sentReminders[selectedTimeFrame]
                      }
                      className="w-full bg-linear-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                    >
                      {sendReminderMutation.isPending
                        ? "Sending..."
                        : registrations.length === 0
                        ? "No Attendees to Remind"
                        : sentReminders[selectedTimeFrame]
                        ? "Reminder Already Sent"
                        : "Send Reminder"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        Confirm Reminder Send
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will send a reminder email to{" "}
                        {registrations.length} registered attendee
                        {registrations.length !== 1 ? "s" : ""}. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-background/50 border border-border/50 rounded-lg p-4 my-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {eventTitle}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {eventDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reminder type: {timeFrameLabels[selectedTimeFrame]}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSendReminder}
                        className="bg-secondary hover:bg-secondary/90"
                      >
                        Send Reminder
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
