import { LoadingFallback } from "@/components/state-screens/LoadingFallback";
import { getNoteQueryOptions } from "@/data-access-layer/notes-query-optons";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { db } from "@/lib/drizzle/client";
import { notes, TNote } from "@/lib/drizzle/schema";
import { useSnackbar } from "@/lib/react-native-paper/snackbar/global-snackbar-store";
import { createGeoJSONPoint } from "@/utils/note-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Dialog, Divider, Portal, Text, useTheme } from "react-native-paper";
import { NoteDetailsForm } from "./NoteDetailsForm";
import { NoteDetailsHeader } from "./NoteDetailsHeader";
import { NoteLocationSection } from "./NoteLocationSection";
import { NoteTagsSection } from "./NoteTagsSection";
import { useUnsavedChanges } from "./use-unsaved-changes";

export type TNoteForm = Omit<TNote, "id" | "created" | "updated" | "location" | "tags"> & {
  tags: string[];
  location?: {
    lat: string;
    lng: string;
  };
};

export function NoteDetails() {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  const { unsavedDialogVisible, handleBack, discardChanges, cancelNavigation } = useUnsavedChanges({
    form,
  });

  const isFormDirty = form.formState.isDirty;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = form.getValues();
      const { location: loc, tags, ...rest } = payload;
      const res = await db
        .update(notes)
        .set({
          ...rest,
          tags: JSON.stringify(tags || []),
          location: createGeoJSONPoint({
            latitude: parseFloat(loc?.lat || "0"),
            longitude: parseFloat(loc?.lng || "0"),
          }),
        })
        .where(eq(notes.id, note!.id));
      return res;
    },
    onSuccess: () => {
      form.reset(form.getValues());
      showSnackbar("Note saved successfully", { duration: 3000 });
    },
    onError: (error: any) => {
      showSnackbar(`Error saving note: ${error.message}`, { duration: 5000 });
    },
    meta: {
      invalidates: [["notes"]],
    },
  });

  const handleSave = async () => {
    await saveMutation.mutateAsync();
    discardChanges(); // This will close the dialog and navigate
  };
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
      <NoteDetailsHeader
        note={note}
        form={form}
        isFormDirty={isFormDirty}
        onBackPress={handleBack}
      />
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
              <NoteTagsSection
                note={note}
                form={form}
                onNavigateToTags={() => router.push("/tags")}
              />
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Unsaved Changes Dialog */}
      <Portal>
        <Dialog visible={unsavedDialogVisible} onDismiss={cancelNavigation}>
          <Dialog.Title>Unsaved Changes</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You have unsaved changes. Would you like to save them before leaving?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelNavigation}>Cancel</Button>
            <Button onPress={discardChanges}>Discard</Button>
            <Button onPress={handleSave} loading={saveMutation.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
