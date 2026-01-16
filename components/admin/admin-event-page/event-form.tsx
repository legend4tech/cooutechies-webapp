"use client";

import { createEvent } from "@/app/actions/events";
import { updateEvent } from "@/app/actions/events";
import type { EventFormData } from "@/lib/validations";
import type { SerializedEvent } from "@/types/serialized.types";

import React, { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  ImageIcon,
  Users,
  FileText,
  Upload,
  X,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";
import { uploadMultipleFilesToS3 } from "@/lib/uploadFileToS3";

const DEFAULT_SPEAKER_IMAGE = "/default-speaker-avatar.png";

type Speaker = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
};

const eventFormSchema = z.object({
  title: z
    .string()
    .min(3, "Event title must be at least 3 characters")
    .max(100, "Event title must not exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters"),
  date: z.string().min(1, "Please select a date and time for the event"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  coverImage: z.string().min(1, "Please upload a cover image"),
  maxAttendees: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      "Maximum attendees must be a positive number"
    ),
  duration: z.string().min(1, "Duration is required"),
});

const speakerSchema = z.object({
  name: z.string().min(1, "Speaker name is required"),
  title: z.string().min(1, "Speaker title is required"),
  bio: z.string().optional().default(""),
  image: z.string(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;
type SpeakerValues = z.infer<typeof speakerSchema>;

interface UnifiedEventFormProps {
  event?: SerializedEvent;
  mode?: "create" | "edit";
}

// Custom hook for image upload using uploadMultipleFilesToS3
const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImages = async (images: string[], descriptions: string[]) => {
    setUploading(true);
    try {
      const uploadedUrls = await uploadMultipleFilesToS3(images, descriptions);
      return uploadedUrls;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImages, uploading };
};

export function EventForm({ event, mode = "create" }: UnifiedEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(
    event?.coverImage || ""
  );
  const [isDragging, setIsDragging] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>(() =>
    mode === "edit" && event?.speakers
      ? event.speakers.map((s, i: number) => ({
          id: `speaker-${i}`,
          name: s.name,
          title: s.role,
          bio: s.bio || "",
          image: s.photo || DEFAULT_SPEAKER_IMAGE,
        }))
      : []
  );
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [speakerImagePreview, setSpeakerImagePreview] = useState<string>(
    DEFAULT_SPEAKER_IMAGE
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speakerImageInputRef = useRef<HTMLInputElement>(null);
  const { uploadImages, uploading } = useImageUpload();

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      date: event?.date ? formatDateForInput(event.date) : "",
      location: event?.location || "",
      coverImage: event?.coverImage || "",
      maxAttendees: event?.maxAttendees?.toString() || "",
      duration: event?.duration || "1 day",
    },
  });

  const speakerForm = useForm<SpeakerValues>({
    resolver: zodResolver(speakerSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      image: DEFAULT_SPEAKER_IMAGE,
    },
  });

  useEffect(() => {
    if (editingSpeaker) {
      speakerForm.reset({
        name: editingSpeaker.name,
        title: editingSpeaker.title,
        bio: editingSpeaker.bio,
        image: editingSpeaker.image,
      });
      setSpeakerImagePreview(editingSpeaker.image);
    } else {
      speakerForm.reset({
        name: "",
        title: "",
        bio: "",
        image: DEFAULT_SPEAKER_IMAGE,
      });
      setSpeakerImagePreview(DEFAULT_SPEAKER_IMAGE);
    }
  }, [editingSpeaker, speakerForm]);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      form.setValue("coverImage", base64String, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    form.setValue("coverImage", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSpeakerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      speakerForm.setValue("image", base64String);
      setSpeakerImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const onSpeakerSubmit = (values: SpeakerValues) => {
    if (editingSpeaker && speakers.find((s) => s.id === editingSpeaker.id)) {
      const updatedSpeakers = speakers.map((s) =>
        s.id === editingSpeaker.id ? { ...s, ...values } : s
      );
      setSpeakers(updatedSpeakers);
      toast.success("Speaker updated successfully");
    } else {
      const newSpeaker: Speaker = {
        id: Date.now().toString(),
        ...values,
      };
      setSpeakers([...speakers, newSpeaker]);
      toast.success("Speaker added successfully");
    }
    cancelEditSpeaker();
  };

  const addSpeaker = () => {
    setEditingSpeaker({
      id: Date.now().toString(),
      name: "",
      title: "",
      bio: "",
      image: DEFAULT_SPEAKER_IMAGE,
    });
  };

  const editSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
  };

  const cancelEditSpeaker = () => {
    setEditingSpeaker(null);
    speakerForm.reset();
    setSpeakerImagePreview(DEFAULT_SPEAKER_IMAGE);
  };

  const deleteSpeaker = (id: string) => {
    setSpeakers(speakers.filter((s) => s.id !== id));
    toast.success("Speaker removed");
  };

  const handleFormSubmit = async (values: EventFormValues) => {
    setLoading(true);

    try {
      const imagesToUpload: string[] = [];
      const imageDescriptions: string[] = [];

      // Add cover image if it's new base64
      if (values.coverImage.startsWith("data:")) {
        imagesToUpload.push(values.coverImage);
        imageDescriptions.push(`cover-${Date.now()}.jpg`);
      }

      // Add speaker images if they're new base64
      const speakerImageIndexes: number[] = [];
      speakers.forEach((speaker, index) => {
        if (
          speaker.image.startsWith("data:") &&
          !speaker.image.startsWith("data:image/svg")
        ) {
          imagesToUpload.push(speaker.image);
          imageDescriptions.push(`speaker-${index}-${Date.now()}.jpg`);
          speakerImageIndexes.push(index);
        }
      });

      // Upload all new images using the hook
      let uploadedUrls: string[] = [];
      if (imagesToUpload.length > 0) {
        toast.loading(`Uploading ${imagesToUpload.length} image(s)...`);
        uploadedUrls = await uploadImages(imagesToUpload, imageDescriptions);
        toast.dismiss();
      }

      // Replace base64 with uploaded URLs
      let coverImageUrl = values.coverImage;
      if (values.coverImage.startsWith("data:") && uploadedUrls.length > 0) {
        coverImageUrl = uploadedUrls[0];
      }

      const updatedSpeakers = speakers.map((speaker, index) => {
        const speakerUploadIndex = speakerImageIndexes.indexOf(index);
        let photoUrl = speaker.image;

        if (speakerUploadIndex !== -1) {
          const urlIndex =
            speakerUploadIndex +
            (values.coverImage.startsWith("data:") ? 1 : 0);
          photoUrl = uploadedUrls[urlIndex] || speaker.image;
        }

        return {
          name: speaker.name,
          role: speaker.title,
          bio: speaker.bio,
          photo: photoUrl,
        };
      });

      const eventData: EventFormData = {
        title: values.title,
        description: values.description,
        date: values.date,
        location: values.location,
        coverImage: coverImageUrl,
        duration: values.duration,
        maxAttendees: values.maxAttendees
          ? Number.parseInt(values.maxAttendees)
          : null,
        speakers: updatedSpeakers,
      };

      console.log(eventData);

      // Call the appropriate action based on mode
      // FIX: Ensure eventId is a string
      const result =
        mode === "edit" && event?._id
          ? await updateEvent(event._id.toString(), eventData)
          : await createEvent(eventData);

      if (result.success) {
        toast.success(
          mode === "edit"
            ? "Event updated successfully"
            : "Event created successfully"
        );
        if (mode === "create") {
          router.push("/admin/events");
        } else if (event?._id) {
          console.log("Event ID:", event?._id); // Add this before the redirect
          router.push(`/admin/events/${event._id}`);
        }
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${mode} event`);
      }
    } catch (error) {
      toast.error(`Failed to ${mode} event. Please try again.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 relative">
      {mode === "create" && (
        <>
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-100 h-100 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-75 h-75 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 p-8 shadow-lg">
        {mode === "create" && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-display">
              <span className="text-gradient">Create Event</span>
            </h1>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Image Upload */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        Event Cover Image
                      </FormLabel>

                      <div
                        className={`relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed ${
                          isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border/50 bg-muted/30"
                        } group hover:border-primary/50 transition-all duration-300 cursor-pointer`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() =>
                          !imagePreview && fileInputRef.current?.click()
                        }
                      >
                        {imagePreview ? (
                          <>
                            <Image
                              src={imagePreview}
                              alt="Cover preview"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  Preview
                                </p>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                  }}
                                  className="h-8 px-3"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6">
                            <Upload
                              className={`w-12 h-12 mb-3 ${
                                isDragging ? "text-primary" : "opacity-50"
                              }`}
                            />
                            <p className="text-sm font-medium mb-1 text-center">
                              {isDragging
                                ? "Drop image here"
                                : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-center">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        Maximum Attendees
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Leave empty for unlimited"
                          {...field}
                          className="bg-background/50 text-foreground border-border/50 focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Optional - Set a limit or leave empty for unlimited
                        capacity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        Event Duration
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 text-foreground border-border/50 focus:border-primary">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1 day">1 Day (24hrs)</SelectItem>
                          <SelectItem value="2 weeks">2 Weeks</SelectItem>
                          <SelectItem value="3 weeks">3 Weeks</SelectItem>
                          <SelectItem value="1 month">1 Month</SelectItem>
                          <SelectItem value="2 months">2 Months</SelectItem>
                          <SelectItem value="3 months">3 Months</SelectItem>
                          <SelectItem value="4 months">4 Months</SelectItem>
                          <SelectItem value="5 months">5 Months</SelectItem>
                          <SelectItem value="6 months">6 Months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Event Details */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {mode === "create" && (
                          <Sparkles className="w-4 h-4 text-primary" />
                        )}
                        Event Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., React Meetup 2024"
                          {...field}
                          className="bg-background/50 text-foreground border-border/50 focus:border-primary transition-colors text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText className="w-4 h-4 text-primary" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your event in detail..."
                          rows={6}
                          {...field}
                          className="bg-background/50 text-foreground border-border/50 focus:border-primary transition-colors resize-none h-36"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        Date & Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="bg-background/50 text-foreground border-border/50 focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Conference Hall A"
                          {...field}
                          className="bg-background/50 text-foreground border-border/50 focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Speakers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Event Speakers
                </label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addSpeaker}
                  disabled={editingSpeaker !== null}
                  className="border-primary/30 "
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Speaker
                </Button>
              </div>

              {speakers.length > 0 && !editingSpeaker && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {speakers.map((speaker) => (
                    <div
                      key={speaker.id}
                      className="glass rounded-xl p-4 group hover:border-primary/30 transition-all"
                    >
                      <div className="flex gap-3">
                        <Image
                          src={speaker.image || DEFAULT_SPEAKER_IMAGE}
                          alt={speaker.name}
                          width={60}
                          height={60}
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">
                            {speaker.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {speaker.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => editSpeaker(speaker)}
                          className="flex-1 h-8"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSpeaker(speaker.id)}
                          className="flex-1 h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editingSpeaker && (
                <div className="bg-background/50 border border-border/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    {speakers.find((s) => s.id === editingSpeaker.id)
                      ? "Edit Speaker"
                      : "New Speaker"}
                  </h3>

                  <Form {...speakerForm}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="shrink-0">
                          <Image
                            src={speakerImagePreview}
                            alt="Speaker preview"
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <input
                            type="file"
                            ref={speakerImageInputRef}
                            onChange={handleSpeakerImageUpload}
                            className="hidden"
                            accept="image/*"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              speakerImageInputRef.current?.click()
                            }
                            className="mt-2"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Upload
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <FormField
                            control={speakerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Speaker Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Full name"
                                    {...field}
                                    className="bg-background/50 border-border/50 focus:border-primary"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={speakerForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Speaker Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., CTO at Acme Corp"
                                    {...field}
                                    className="bg-background/50 border-border/50 focus:border-primary"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={speakerForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Speaker Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief bio about the speaker..."
                                {...field}
                                rows={3}
                                className="bg-background/50 border-border/50 focus:border-primary resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={cancelEditSpeaker}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={speakerForm.handleSubmit(onSpeakerSubmit)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {speakers.find((s) => s.id === editingSpeaker.id)
                            ? "Update"
                            : "Add"}{" "}
                          Speaker
                        </Button>
                      </div>
                    </div>
                  </Form>
                </div>
              )}

              {speakers.length === 0 && !editingSpeaker && (
                <div
                  className="text-center py-12 border-2 border-dashed border-border/50
                rounded-lg bg-muted/20"
                >
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No speakers added yet
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || editingSpeaker !== null || uploading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading || uploading
                  ? mode === "edit"
                    ? "Updating Event..."
                    : "Creating Event..."
                  : mode === "edit"
                  ? "Update Event"
                  : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
