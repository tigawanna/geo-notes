# React Native Hook Form Components

Example usage of the reusable React Hook Form components for React Native

✨ SIMPLIFIED API - Now you only need to pass the form instance!

1. FormErrorDisplay:
   - Automatically extracts error messages from form.formState.errors
   - Automatically checks if form has errors AND was submitted
   - Still configurable with title, maxErrors, and style

2. FormStateDebug:
   - Automatically shows form.formState.errors by default
   - Set showFullState={true} to see the entire form state
   - Only shows in development mode

BEFORE (manual):
```tsx
const errorMessages = extractErrorMessages(form.formState.errors);
const hasErrors = hasFormErrors(form.formState);
<FormErrorDisplay errorMessages={errorMessages} isVisible={hasErrors} />
```

AFTER (automatic):
```tsx
<FormErrorDisplay form={form} />
```

Much cleaner! 🚀

## Example Usage

```tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { FormErrorDisplay, FormStateDebug } from "@/lib/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

// Example schema
const exampleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

export function ExampleForm() {
  const form = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 0,
    },
  });

  const onSubmit = (data: ExampleFormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <View style={{ padding: 16, gap: 16 }}>
      {/* Form fields */}
      <Controller
        control={form.control}
        name="name"
        render={({ field }) => (
          <TextInput
            style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
            placeholder="Name"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      
      {/* Submit button */}
      <TouchableOpacity
        style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
        onPress={form.handleSubmit(onSubmit)}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Submit</Text>
      </TouchableOpacity>

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
        showFullState={false} // false = errors only, true = full form state
      />
    </View>
  );
}
```
```
