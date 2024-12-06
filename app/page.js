"use client";
import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFetch } from "@/lib/api";
import {
  DialogReceipt,
  DialogUploadReceipt,
} from "@/components/homepage/dialog";
import { optionsDate } from "@/components/homepage/constant";
import { SkeletonLoadingTable } from "@/components/homepage/skeleton";
import { formatCurrency } from "@/lib/tools";
import {
  ManipulateMembers,
  YearPlusMonth,
} from "@/components/homepage/function";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const {
    data: dataRaw,
    loading: loadingUsers,
    refetch: refetchMembers,
  } = useFetch({ table: "users" });

  const members = ManipulateMembers(dataRaw);

  const amountPerEntry = 150000;
  const totalSumAmount = members.reduce((total, person) => {
    const historyCount = person.histories ? person.histories.length : 0;
    return total + historyCount * amountPerEntry;
  }, 0);

  return (
    <div className="h-screen px-4 sm:px-10 md:px-20 lg:px-40 xl:px-52">
      <AccountHeader totalSumAmount={totalSumAmount} />
      <div className="flex items-center justify-center ">
        <TableDemo
          array={members}
          loading={loadingUsers}
          totalSumAmount={totalSumAmount}
          amountPerEntry={amountPerEntry}
          refetchMembers={refetchMembers}
        />
      </div>
    </div>
  );
}

export const TableDemo = ({
  array = [],
  loading,
  refetchMembers,
  totalSumAmount,
  amountPerEntry,
}) => {
  const [showButton, setShowButton] = useState(0);

  const isShowButton = showButton > 10;

  if (loading || !array.length) return <SkeletonLoadingTable />;
  return (
    <Table className="border-collapse w-full">
      <TableCaption>
        {isShowButton && (
          <DialogUploadReceipt
            array={array}
            loading={loading}
            refetch={refetchMembers}
          />
        )}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0 whitespace-nowrap">No</TableHead>
          <TableHead className="w-0 whitespace-nowrap"></TableHead>
          <TableHead className="whitespace-nowrap">Nama</TableHead>
          {optionsDate?.map((item, index) => (
            <TableHead key={index} className="whitespace-nowrap">
              {item?.alias}
            </TableHead>
          ))}
          <TableHead className="text-right whitespace-nowrap">
            Jumlah (per orang)
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {array?.map((member, index) => {
          const { histories, isMaster, photo_url } = member || {};
          const price = histories?.length * amountPerEntry;
          const totalAmount = price ? formatCurrency(price) : 0;
          return (
            <TableRow key={index}>
              <TableCell className="whitespace-nowrap">{index + 1}</TableCell>
              <TableCell className="whitespace-nowrap">
                <Avatar>
                  <AvatarImage src={photo_url} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell
                className="font-semibold my-auto whitespace-nowrap"
                onClick={() => {
                  if (isMaster) {
                    setShowButton(showButton + 1);
                  }
                }}
              >
                {member.name}
              </TableCell>
              {optionsDate?.map((dateOption, index) => {
                const { value } = dateOption || {};
                const isChecklist = histories?.some(
                  (item) => item.period == value
                );

                const isShowChecklist =
                  isChecklist || (isMaster && value <= Number(YearPlusMonth));

                return (
                  <TableCell
                    key={index}
                    className={`border whitespace-nowrap ${
                      isShowChecklist ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {isShowChecklist ? (
                      <DialogReceipt member={member} date={dateOption} />
                    ) : (
                      ""
                    )}
                  </TableCell>
                );
              })}
              <TableCell className="text-right whitespace-nowrap">{`IDR ${totalAmount}`}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell
            colSpan={12}
            className="font-semibold text-right whitespace-nowrap"
          >
            Total Tabungan
          </TableCell>
          <TableCell className="text-right whitespace-nowrap">{`IDR ${formatCurrency(
            totalSumAmount
          )}`}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export const AccountHeader = ({ totalSumAmount }) => {
  const { toast } = useToast();

  const accountNumber = "0075 7824 5926";
  const accountNumberWithoutSpace = accountNumber.replace(/\s+/g, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumberWithoutSpace);
    toast({
      title: "Berhasil menyalin nomor rekening",
    });
  };

  return (
    <div className="my-10 flex justify-between items-center">
      <div className="flex flex-col text-lg sm:text-xl md:text-2xl">
        <span className="text-md sm:text-xl md:text-2xl font-semibold">
          IDR {formatCurrency(totalSumAmount)}
        </span>
        <span className="text-xs -mt-1 text-gray-400">(Saldo sementara)</span>
      </div>
      <div
        className="flex flex-col justify-center items-end gap-2 cursor-pointer"
        onClick={handleCopy}
      >
        <div className="flex items-center gap-2">
          <img
            src="/blu.png"
            className="w-4 h-auto sm:w-6 md:w-8 rounded-full"
          />
          <span className="text-md sm:text-xl md:text-2xl font-semibold">
            {accountNumber}
          </span>
        </div>
        <div className="text-xs -mt-3 text-gray-400">klik untuk menyalin</div>
      </div>
    </div>
  );
};
