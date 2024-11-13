"use client";
import checklistIcon from "@/public/checklist.svg";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadStorage, useFetch } from "@/lib/api";
import { supabase } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { useModalHook } from "@/lib/hooks";

export default function Home() {
  const {
    data: members,
    loading: loadingUsers,
    refetch: refetchMembers,
  } = useFetch({ table: "users" });

  return (
    <div className="flex items-center justify-center px-4 sm:px-10 md:px-20 lg:px-40 xl:px-52">
      <TableDemo
        array={members}
        loading={loadingUsers}
        refetchMembers={refetchMembers}
      />
    </div>
  );
}

export const optionsDate = [
  {
    label: "November 2024",
    alias: "Nov'24",
    value: 2411,
    month: "November",
    year: 2024,
  },
  {
    label: "December 2024",
    alias: "Dec'24",
    value: 2412,
    month: "December",
    year: 2024,
  },
  {
    label: "January 2025",
    alias: "Jan'25",
    value: 2501,
    month: "January",
    year: 2025,
  },
  {
    label: "February 2025",
    alias: "Feb'25",
    value: 2502,
    month: "February",
    year: 2025,
  },
  {
    label: "March 2025",
    alias: "Mar'25",
    value: 2503,
    month: "March",
    year: 2025,
  },
  {
    label: "April 2025",
    alias: "Apr'25",
    value: 2504,
    month: "April",
    year: 2025,
  },
  {
    label: "May 2025",
    alias: "May'25",
    value: 2505,
    month: "May",
    year: 2025,
  },
  {
    label: "June 2025",
    alias: "Jun'25",
    value: 2506,
    month: "June",
    year: 2025,
  },
  {
    label: "July 2025",
    alias: "Jul'25",
    value: 2507,
    month: "July",
    year: 2025,
  },
];

const formatCurrency = (value) => new Intl.NumberFormat("en-DE").format(value);

export const TableDemo = ({ array = [], loading, refetchMembers }) => {
  const amountPerEntry = 150000;
  const totalSumAmount = array.reduce((total, person) => {
    const historyCount = person.histories ? person.histories.length : 0;
    return total + historyCount * amountPerEntry;
  }, 0);

  if (loading || !array.length) return <SkeletonLoadingTable />;
  return (
    <Table>
      <TableCaption>
        <DialogDemo array={array} loading={loading} refetch={refetchMembers} />
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">No</TableHead>
          <TableHead className="w-0"></TableHead>
          <TableHead className="w-[100px]">Nama</TableHead>
          {optionsDate?.map((item, index) => (
            <TableHead key={index}>{item?.alias}</TableHead>
          ))}
          <TableHead className="text-right">Jumlah (per orang)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {array?.map((member, index) => {
          const { histories } = member || {};
          const price = histories?.length * amountPerEntry;
          const totalAmount = price ? formatCurrency(price) : 0;
          return (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Avatar>
                  {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-semibold my-auto">
                {member.name}
              </TableCell>
              {optionsDate?.map((dateOption, index) => {
                const { value } = dateOption || {};
                const isChecklist = histories?.some(
                  (item) => item.period == value
                );

                return (
                  <TableCell key={index}>
                    {isChecklist ? (
                      // <img
                      //   src={checklistIcon?.src}
                      //   className="w-5 cursor-pointer mx-auto"
                      // />
                      <DialogReceipt member={member} date={dateOption} />
                    ) : (
                      ""
                    )}
                  </TableCell>
                );
              })}
              <TableCell className="text-right">{`IDR ${totalAmount}`}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={12} className="font-semibold text-right">
            Total Tabungan
          </TableCell>
          <TableCell className="text-right">{`IDR ${formatCurrency(
            totalSumAmount
          )}`}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export const SkeletonLoadingTable = () => {
  return (
    <div className="space-y-2 w-full">
      {Array(10)
        .fill("")
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-100 rounded-md h-12 animate-pulse"
          ></div>
        ))}
    </div>
  );
};

export const DialogDemo = ({ array = [], refetch }) => {
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
  const { name, histories } = member || {};
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
        onClick={toggle}
      />
      {/* <Button variant="outline" onClick={toggle}>
        Upload Bukti Tabungan
      </Button> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>
        <div className="text-center">
          <img src={imageUrl?.publicUrl} className="w-1/2 h-auto" />
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const addSavingHistory = async ({ userId, period, receiptUrl }) => {
  // Membuat objek JSON baru untuk dimasukkan
  const newEntry = {
    period,
    receiptUrl,
  };

  // Dapatkan data `saving_history` yang ada
  const { data: existingData, error: selectError } = await supabase
    .from("users")
    .select("histories")
    .eq("id", userId)
    .single();

  if (selectError) {
    console.error("Error fetching saving_history:", selectError);
    return;
  }

  // Tambahkan entri baru ke `saving_history` yang sudah ada
  const isUpdateReceipt = existingData?.histories?.some(
    (entry) => entry.period === period
  );

  const updatedReceiptUrl = existingData?.histories?.map((entry) => {
    if (entry.period === period) {
      return {
        ...entry,
        receiptUrl: receiptUrl,
      };
    }
    return entry;
  });

  const updatedHistory = existingData.histories
    ? isUpdateReceipt
      ? [...updatedReceiptUrl]
      : [...updatedReceiptUrl, newEntry]
    : [newEntry];

  // Update `saving_history` di Supabase
  const { error: updateError } = await supabase
    .from("users")
    .update({ histories: updatedHistory })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating saving_history:", updateError);
  } else {
    console.log("Saving history updated successfully");
  }
};
