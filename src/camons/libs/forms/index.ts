"use client";
import { z, ZodRawShape, ZodObject } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, DefaultValues, SubmitHandler } from "react-hook-form";

type TUseControlledFormParams<T extends ZodRawShape> = {
  schema: ZodObject<T>;
  defaultValues?: DefaultValues<z.infer<ZodObject<T>>>;
  onSubmit: SubmitHandler<z.infer<ZodObject<T>>>;
};

export function useControlledForm<T extends ZodRawShape>({
  schema,
  defaultValues,
  onSubmit,
}: TUseControlledFormParams<T>) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(onSubmit);
  return [form, handleSubmit] as const;
}
