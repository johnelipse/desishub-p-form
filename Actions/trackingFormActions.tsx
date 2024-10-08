"use server";
import { db } from "@/lib/db";
import { FormProps } from "@/types/nav";
import { revalidatePath } from "next/cache";

export async function createFormData(formData: FormProps) {
  try {
    const {
      name,
      role,
      day,
      kpiScores,
      attendance,
      timeIn,
      timeOut,
      notes,
      userId,
      roleId,
    } = formData;

    // Check if a report already exists for this user on this day
    const existingReport = await db.formData.findFirst({
      where: {
        userId: userId,
        day: day,
      },
    });

    if (existingReport) {
      return { 
        error: "A report for this user on this day already exists.",
        data:null,
         status:409
       };
    }

    // If no existing report, create a new one
    const createdData = await db.formData.create({
      data: {
        name,
        role,
        day,
        kpiScores,
        attendance,
        timeIn,
        timeOut,
        notes,
        userId,
        roleId,
      },
    });

    revalidatePath("/")
    revalidatePath("/reports")
    return { 
      success: true, 
      data: createdData,
      error:null,
      status:201
     };
  } catch (error) {
    console.error("Error creating form data:", error);
    return { error: "An error occurred while creating the report." };
  }
}

export async function fetchFormData() {
  try {
    const fetchedFormData = await db.formData.findMany({
      include: {
        User: true,
        Role: true,
      },
    });

    const processedFormData = fetchedFormData.map((data) => ({
      id: data.id,
      day: data.day,
      attendance: data.attendance,
      timeIn: data.timeIn,
      timeOut: data.timeOut,
      notes: data.notes,
      user: data.name,
      role: data.role,
      kpiScores: Object.entries(data.kpiScores as Record<string, string>).map(
        ([name, score]) => ({
          name,
          score,
        })
      ),
    }));

    return { reports: processedFormData };
  } catch (error) {
    console.error("Failed to fetch form data:", error);
    throw new Error("Failed to fetch form data");
  }
}

export async function allFormData(orderBy: 'createdAt' | 'updatedAt' = 'createdAt') {
  try {
    const fetchedFormData = await db.formData.findMany({
      orderBy: { [orderBy]: "desc" },
      include: {
        User: true,
        Role: true,
      },
    });

    return fetchedFormData;
  } catch (error) {
    console.error("Failed to fetch filtered form data:", error);
    throw new Error("Failed to fetch filtered form data");
  }
}

export async function getSingleData({id}:FormData | any){
  try {
   const fetchedData = await db.formData.findUnique({
    where:{
      id:id
    },
    include: {
      User: true,
      Role: true,
    },
   }) 

  return fetchedData
  } catch (error) {
    console.log(error)
  }
}

export async function deleteData({id}:FormData | any){
  try {
   const deletedData = await db.formData.delete({
    where:{
      id:id
    }
   })
   revalidatePath("/reports") 
  return deletedData
  } catch (error) {
    console.log(error)
  }
}