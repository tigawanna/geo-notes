import {
  GeoNoteInsert,
  GeoNoteSelect,
  updateNoteSchema,
  insertNoteSchema,
} from "@/lib/drizzle/schema";
import { useForm, Controller } from "react-hook-form";
import { StyleSheet, ScrollView, View, TextInput } from "react-native";
import {
  TextInput as PaperTextView,
  Button,
  SegmentedButtons,
  Chip,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { LoadingIndicatorDots } from "@/components/state-screens/LoadingIndicatorDots";
import { updateNoteMutationFunction } from "@/data-access-layer/mutate-notes";
import { useMutation } from "@tanstack/react-query";




interface NotesFormProps {
  existingNote?: GeoNoteSelect | null;
}

export function NotesForm({ existingNote }: NotesFormProps) {
  const theme = useTheme();
  const { location } = useDeviceLocation();
  const { mutate, isPending } = useMutation(updateNoteMutationFunction);
  // const { location, isRefreshing, refetch, isLoading } = useDeviceLocation();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(existingNote?.tags?.split(",") || []);
  const [overwriteLocation, setOverwriteLocation] = useState(false);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      type: existingNote?.type || "note",
      title: existingNote?.title || "",
      content: existingNote?.content || "",
      quickCopy: existingNote?.quickCopy || "",
      status: existingNote?.status || "active",
      priority: existingNote?.priority || 0,
      completedAt: existingNote?.completedAt,
      dueDate: existingNote?.dueDate,
      tags: existingNote?.tags,
      reminderAt: existingNote?.reminderAt,
      latitude: existingNote?.latitude ?? location?.coords.latitude,
      longitude: existingNote?.longitude ?? location?.coords.longitude,
    },
    resolver: zodResolver(updateNoteSchema),
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue("tags", newTags.join(","));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags.join(","));
  };

  const onSubmit = (data: GeoNoteInsert) => {
    mutate({
      payload: {
        ...data,
        latitude: overwriteLocation ? location?.coords.latitude : data.latitude,
        longitude: overwriteLocation ? location?.coords.longitude : data.longitude,
      },
      id: existingNote?.id as number,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              // label="Title"
              value={value as string | undefined}
              onChangeText={onChange}
              placeholder="Title"
              style={[
                styles.input,
                { color: theme.colors.onBackground, padding: 6, fontWeight: "600", fontSize: 24 },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <TextInput
              // label="Content"
              placeholder="Content"
              value={value ?? undefined}
              onChangeText={onChange}
              multiline
              numberOfLines={10}
              style={[
                styles.input,
                {
                  minHeight: 250,
                  flexGrow: 1,
                  fontSize: 16,
                  justifyContent: "flex-start",
                  textAlignVertical: "top",
                  color: theme.colors.onBackground,
                },
              ]}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="quickCopy"
        render={({ field: { onChange, value } }) => (
          <PaperTextView
            label="Quick Copy"
            value={value ?? undefined}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="longitude"
        render={({ field: { onChange, value } }) => (
          <PaperTextView
            label="longitude"
            value={value ? value.toString() : undefined}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="latitude"
        render={({ field: { onChange, value } }) => (
          <PaperTextView
            label="latitude"
            value={value ? value.toString() : undefined}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />

      {existingNote && (
        <View style={styles.switchContainer}>
          <Text variant="bodyMedium">Use current location</Text>
          <Switch
            value={overwriteLocation}
            onValueChange={(value) => {
              setOverwriteLocation(value);
              if (value && location) {
                setValue("latitude", location.coords.latitude);
                setValue("longitude", location.coords.longitude);
              }
            }}
          />
        </View>
      )}

      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={[
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
              { value: "deleted", label: "Deleted" },
            ]}
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="priority"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value ? value?.toString() : "0"}
            onValueChange={(val) => onChange(parseInt(val))}
            buttons={[
              { value: "0", label: "Low" },
              { value: "1", label: "Medium" },
              { value: "2", label: "High" },
            ]}
            style={styles.input}
          />
        )}
      />

      <PaperTextView
        label="Add Tag"
        value={tagInput}
        onChangeText={setTagInput}
        onSubmitEditing={addTag}
        right={<PaperTextView.Icon icon="plus" onPress={addTag} />}
        style={styles.input}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
        {tags.map((tag) => (
          <Chip key={tag} onClose={() => removeTag(tag)} style={styles.tag}>
            {tag}
          </Chip>
        ))}
      </ScrollView>

      <Button
        disabled={isPending}
        mode="contained-tonal"
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}>
        {isPending ? (
          <LoadingIndicatorDots />
        ) : (
          <Text>{existingNote ? "Update Note" : "Create Note"}</Text>
        )}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: 14,
  },
  content: {
    // padding: ,
    paddingBottom: 100,
    gap: 12,
  },
  input: {
    // marginBottom: 16,
    // border
  },
  tagsContainer: {
    // marginBottom: 16,
  },
  tag: {
    marginRight: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 16,
  },
});
