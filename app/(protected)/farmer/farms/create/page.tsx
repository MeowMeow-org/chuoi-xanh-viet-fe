"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCreateFarmMutation } from "@/hooks/useFarm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CreateFarmFormValues = {
  name: string;
  areaHa: string;
  cropMain: string;
  province: string;
  district: string;
  ward: string;
  address: string;
};

export default function CreateFarmPage() {
  const router = useRouter();
  const createFarmMutation = useCreateFarmMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFarmFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      areaHa: "",
      cropMain: "",
      province: "",
      district: "",
      ward: "",
      address: "",
    },
  });

  const onSubmit = (values: CreateFarmFormValues) => {
    const normalizedArea = values.areaHa.trim();
    const areaHa = normalizedArea ? Number(normalizedArea) : undefined;

    if (areaHa !== undefined && Number.isNaN(areaHa)) {
      toast.error("Diện tích phải là số hợp lệ");
      return;
    }

    createFarmMutation.mutate(
      {
        name: values.name.trim(),
        areaHa,
        cropMain: values.cropMain.trim() || undefined,
        province: values.province.trim() || undefined,
        district: values.district.trim() || undefined,
        ward: values.ward.trim() || undefined,
        address: values.address.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Tạo nông trại thành công");
          router.push("/farmer/farms");
        },
        onError: () => {
          toast.error("Không thể tạo nông trại. Vui lòng thử lại.");
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Tạo nông trại mới</h1>
          <p className="text-sm text-muted-foreground">
            Nhập thông tin cơ bản để bắt đầu quản lý mùa vụ.
          </p>
        </div>
        <Link
          href="/farmer/farms"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin nông trại</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Input
                placeholder="Tên nông trại *"
                {...register("name", {
                  required: "Vui lòng nhập tên nông trại",
                  minLength: {
                    value: 2,
                    message: "Tên nông trại tối thiểu 2 ký tự",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                placeholder="Diện tích (ha)"
                {...register("areaHa")}
              />
              <Input placeholder="Cây trồng chính" {...register("cropMain")} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input placeholder="Tỉnh/Thành" {...register("province")} />
              <Input placeholder="Quận/Huyện" {...register("district")} />
              <Input placeholder="Phường/Xã" {...register("ward")} />
            </div>

            <Input placeholder="Địa chỉ chi tiết" {...register("address")} />

            <Button
              type="submit"
              disabled={createFarmMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createFarmMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createFarmMutation.isPending ? "Đang tạo..." : "Tạo nông trại"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
