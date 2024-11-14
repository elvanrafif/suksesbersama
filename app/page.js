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
import { ManipulateMembers, YearPlusMonth } from "@/components/homepage/function";

export default function Home() {
  const {
    data: dataRaw,
    loading: loadingUsers,
    refetch: refetchMembers,
  } = useFetch({ table: "users" });

  const members = ManipulateMembers(dataRaw);

  return (
    <div className="flex items-center justify-center h-screen px-4 sm:px-10 md:px-20 lg:px-40 xl:px-52">
      <TableDemo
        array={members}
        loading={loadingUsers}
        refetchMembers={refetchMembers}
      />
    </div>
  );
}

export const TableDemo = ({ array = [], loading, refetchMembers }) => {
  const [showButton, setShowButton] = useState(0);

  const isShowButton = showButton > 10;

  const amountPerEntry = 150000;
  const totalSumAmount = array.reduce((total, person) => {
    const historyCount = person.histories ? person.histories.length : 0;
    return total + historyCount * amountPerEntry;
  }, 0);

  if (loading || !array.length) return <SkeletonLoadingTable />;
  return (
    <Table className="border-collapse">
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
          const { histories, isMaster } = member || {};
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
              <TableCell
                className="font-semibold my-auto"
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
                    className={`border ${
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
