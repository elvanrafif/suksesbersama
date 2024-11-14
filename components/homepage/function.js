import { supabase } from "@/lib/utils";
import { optionsDate } from "./constant";

const date = new Date();
const year = date.getFullYear().toString().slice(2); // Ambil dua digit terakhir tahun
const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tambah 1 karena getMonth() mulai dari 0, lalu format dengan 2 digit
export const YearPlusMonth = year + month;

export const ManipulateMembers = (dataRaw) => {
  const members = dataRaw?.map((item) => {
    const isMaster = item.id == 5;
    const manipulateHistories = isMaster
      ? optionsDate
          .filter((option) => option.value <= Number(YearPlusMonth))
          .map((option) => ({ period: option.value }))
      : null;

    if (isMaster) {
      return {
        ...item,
        isMaster: true,
        histories: manipulateHistories,
      };
    }
    return item;
  });

  return members;
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
