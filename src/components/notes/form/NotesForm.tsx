import { LoadingIndicatorDots } from "@/components/state-screens/LoadingIndicatorDots";
import { updateNoteMutationFunction } from "@/data-access-layer/mutate-notes";
import { useDeviceLocation } from "@/hooks/use-device-location";
import {
  GeoNoteInsert,
  GeoNoteSelect,
  updateNoteSchema
} from "@/lib/drizzle/schema";
import { FormErrorDisplay } from "@/lib/react-hook-form/FormErrorDisplay";
import { FormFieldError } from "@/lib/react-hook-form/FormFieldError";
import { FormStateDebug } from "@/lib/react-hook-form/FormStateDebug";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import {
  Button,
  Chip,
  TextInput as PaperTextView,
  SegmentedButtons,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";




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



const form = useForm({
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
  const { control, handleSubmit, setValue } = form
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
    const payload: GeoNoteInsert = {
      ...data,
      latitude: overwriteLocation ? location?.coords.latitude : data.latitude,
      longitude: overwriteLocation ? location?.coords.longitude : data.longitude,
    };
    console.log("payload == ", payload)
    mutate({
      payload,
      id: existingNote?.id as number,
    });
  };
console.log("is dirty == ",form.formState.isDirty)
console.log("is valid == ", form.formState.isValid)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value, name } }) => (
            <FormFieldError fieldName={name} form={form}>
              <TextInput
                // label="Title"
                value={value as string | undefined}
                onChangeText={(text)=>onChange(text)}
                placeholder="Title"
                style={[
                  styles.input,
                  { color: theme.colors.onBackground, padding: 6, fontWeight: "600", fontSize: 24 },
                ]}
              />
            </FormFieldError>
          )}
        />

        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value, name } }) => (
            <FormFieldError fieldName={name} form={form}>
              <TextInput
                // label="Content"
                placeholder="Content"
                value={value ?? undefined}
                onChangeText={(text) => {
                  onChange(text);
                }}
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
            </FormFieldError>
          )}
        />
      </View>

      <Controller
        control={control}
        name="quickCopy"
        render={({ field: { onChange, value, name } }) => (
          <FormFieldError fieldName={name} form={form}>
            <PaperTextView
              label="Quick Copy"
              value={value ?? undefined}
              onChangeText={onChange}
              style={styles.input}
            />
          </FormFieldError>
        )}
      />
      <Controller
        control={control}
        name="longitude"
        render={({ field: { onChange, value,name } }) => (
         <FormFieldError fieldName={name} form={form}>
           <PaperTextView
             label="longitude"
             value={value ? value.toString() : undefined}
             onChangeText={onChange}
             style={styles.input}
           />
         </FormFieldError> 
        )}
      />
      <Controller
        control={control}
        name="latitude"
        render={({ field: { onChange, value, name } }) => (
          <FormFieldError fieldName={name} form={form}>
            <PaperTextView
              label="latitude"
              value={value ? value.toString() : undefined}
              onChangeText={onChange}
              style={styles.input}
            />
          </FormFieldError>
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
      {/* Enhanced Error Display - Just pass the form! */}
      <FormErrorDisplay
        form={form}
        title="Please fix the following errors:"
        maxErrors={5}
        style={{ marginTop: 8 }}
      />

      {/* Development Debug Info - Just pass the form! */}
      <FormStateDebug
        form={form}
        title="🔧 Debug Form Errors"
        showFullState={true} // false = errors only, true = full form state
      />
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
