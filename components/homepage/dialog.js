import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModalHook } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { addSavingHistory } from "./function";
import { optionsDate } from "./constant";
import checklistIcon from "@/public/checklist.svg";
import { supabase } from "@/lib/utils";
import { SkeletonLoadingReceipt } from "./skeleton";

export const DialogUploadReceipt = ({ array = [], refetch }) => {
  const [name, setName] = useState(false);
  const [date, setDate] = useState(false);
  const [file, setFile] = useState(false);

  const isDisabled = !name || !date || !file;

  const { isOpen, toggle } = useModalHook();

  const optionsName = array?.map((item) => {
    return {
      value: item.name.toLowerCase(),
      label: item.name,
      ...item,
    };
  });

  const reset = () => {
    setName(false);
    setDate(false);
    setFile(false);
  };

  const onSubmit = async () => {
    const getIdUser = array?.filter(
      (item) => item.name?.toLowerCase() == name
    )[0]?.id;
    const newFile = file?.target?.files[0];

    const { data, error } = await supabase.storage
      .from("receipt")
      .upload(`receipt-${Date.now()}.jpeg`, newFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: newFile?.mimetype,
      });

    await addSavingHistory({
      userId: getIdUser,
      period: date,
      receiptUrl: data?.path,
    });

    refetch();
    toggle();
  };

  const arraySelect = [
    {
      title: "Nama",
      option: optionsName,
      setter: setName,
    },
    {
      title: "Periode",
      option: optionsDate,
      setter: setDate,
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        reset();
        toggle();
      }}
    >
      <Button variant="outline" onClick={toggle}>
        Upload Bukti Tabungan
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Bukti Tabungan</DialogTitle>
          <DialogDescription>
            Unggah bukti pembayaran tabungan Anda di sini. Pastikan informasi
            sudah benar sebelum klik "Simpan".
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between gap-2">
          {arraySelect?.map((item, index) => {
            const { title, option, setter } = item || {};
            return (
              <Select onValueChange={(e) => setter(e)} key={index}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={title} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{title}</SelectLabel>
                    {option?.map((item, index) => {
                      const { value, label } = item || {};
                      return (
                        <SelectItem key={index} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          })}
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input id="picture" type="file" onChange={(e) => setFile(e)} />
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} className="w-full" disabled={isDisabled}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DialogReceipt = ({ member, date }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const { isOpen, toggle } = useModalHook();
  const { name, histories, isMaster } = member || {};
  const { label, value: valueDate } = date || {};

  const show = async () => {
    const getImageUrl = histories?.filter((item) => item.period == valueDate)[0]
      ?.receiptUrl;
    const { data: image_url } = await supabase.storage
      .from("receipt")
      .getPublicUrl(getImageUrl);
    setImageUrl(image_url);
  };

  useEffect(() => {
    if (isOpen) {
      show();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={toggle} className="w-full">
      <img
        src={checklistIcon?.src}
        className="w-5 cursor-pointer mx-auto"
        onClick={() => {
          if (isMaster) return;
          toggle();
        }}
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>
        <div className="text-center">
          {!imageUrl ? (
            <SkeletonLoadingReceipt />
          ) : (
            <img src={imageUrl?.publicUrl} className="w-2/3 h-auto mx-auto" />
          )}
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
