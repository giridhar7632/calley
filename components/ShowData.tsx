"use client"

import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { createCalendarEvent } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"

export interface ExcelData {
  [key: string]: any;
}

export const parseExcel = (file: File): Promise<{ data: ExcelData[]; columns: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          throw new Error('Excel file must contain at least a header row and one data row');
        }

        const headers = jsonData[0] as string[];
        const columns = headers;

        const rows = jsonData.slice(1).map(row => {
          const obj: ExcelData = {};
          headers.forEach((header, index) => {
            const cellValue = row[index];
            if (["date", "time"].some((word) => header.toLowerCase().includes(word)) && typeof cellValue === "number") {
              const parsedDate = XLSX.SSF.format("yyyy-mm-dd HH:MM", cellValue);
              obj[header] = parsedDate;
            }
            else {
              if (typeof cellValue === "boolean") {
                obj[header] = cellValue ? "true" : "false";
              } else {
                obj[header] = cellValue;
              }
            }
          });
          return obj;
        });

        resolve({ data: rows, columns });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export default function ShowData() {
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [columns, setColumns] = useState<any[]>([]);
  const { toast } = useToast()

  const handleFileAccepted = async (file: File) => {
    try {
      const { data, columns } = await parseExcel(file);
      setExcelData(data);
      setColumns(columns);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
    }
  };

  const handleImport = async () => {
    // import events to google calendar
    try {
      setIsLoading(true)
      const { success, message } = await createCalendarEvent(excelData, Intl.DateTimeFormat().resolvedOptions().timeZone)
      toast({ title: success ? 'Success' : 'Error', description: message, variant: success ? 'default' : 'destructive' })
    } catch (error) {
      console.error('Error creating calendar events:', error);
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-full'>
      <FileUpload onFileAccepted={handleFileAccepted} />

      {excelData.length > 0 && (
        <div className="space-y-4 my-4">
          <DataTable data={excelData} columns={columns} />

          <div className="flex justify-end">
            <Button disabled={isLoading} onClick={handleImport} className="space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Import to Calendar</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}