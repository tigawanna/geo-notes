import { LoadingFallback } from "@/components/state-screens/LoadingFallback";
import { getNoteQueryOptions } from "@/data-access-layer/notes-query-optons";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { TNote, TTag } from "@/lib/drizzle/schema";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Divider, Text, useTheme } from "react-native-paper";
import { NoteDetailsHeader } from "../dets/NoteDetailsHeader";
import { NoteDetailsForm } from "./NoteDetailsForm";
import { useEffect } from "react";
import { NoteTagsSection } from "./NoteTagsSection";
import { NoteLocationSection } from "./NoteLocationSection";

export type TNoteForm = Omit<TNote, "id" | "created" | "updated" | "location" | "tags"> & {
  tags: string[];
  location?: {
    lat: string;
    lng: string;
  };
};

export function NoteDetails() {
  const theme = useTheme();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { location } = useDeviceLocation();
  const lat = location?.coords.latitude || 0;
  const lng = location?.coords.longitude || 0;

  const { data, isPending, error } = useQuery(
    getNoteQueryOptions(id, {
      lat,
      lng,
    })
  );

  const note = data?.result;
  const queryError = data?.error || error?.message;

  const form = useForm<TNoteForm>({
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      quickCopy: note?.quickCopy || "",
      tags: note?.tags ? JSON.parse(note.tags) : [],
      location: {
        lat: note?.latitude || lat.toString(),
        lng: note?.longitude || lng.toString(),
      },
    },
  });
  useEffect(() => {
    form.setValue("title", note?.title || "");
    form.setValue("content", note?.content || "");
    form.setValue("quickCopy", note?.quickCopy || "");
    form.setValue("tags", note?.tags ? JSON.parse(note.tags) : []);
    form.setValue("location", {
      lat: note?.latitude || lat.toString(),
      lng: note?.longitude || lng.toString(),
    });
  }, [form, form.formState.defaultValues, lat, lng, note]);

  const isFormDirty = form.formState.isDirty;
  if (isPending) {
    return <LoadingFallback />;
  }
  if (queryError || !note) {
    return (
      <View
        style={[
          {
            flex: 1,
            backgroundColor: theme.colors.background,
          },
        ]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Error" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={[styles.errorText, { color: theme.colors.error }]}>
            Failed to load note
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}>
      <NoteDetailsHeader note={note} form={form} isFormDirty={isFormDirty} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Main Content - Flush with screen */}
          <View style={styles.mainContent}>
            <NoteDetailsForm form={form} note={note} />
          </View>

          <Divider style={styles.divider} />

          {/* Location Card */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <NoteLocationSection note={note} form={form} />
            </Card.Content>
          </Card>

          {/* Tags Card */}
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <NoteTagsSection note={note} form={form} />
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
    height: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontWeight: "600",
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  savingCard: {
    borderRadius: 16,
    minWidth: 200,
  },
  savingContent: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
});
