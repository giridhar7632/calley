'use client'

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function Index() {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleFileAccepted = async (file: File) => {
    // In v1, we'll just show a placeholder table
    // In v2, we'll implement actual Excel parsing
    setColumns(['Event', 'Date', 'Time', 'Location']);
    setExcelData([
      {
        Event: 'Team Meeting',
        Date: '2024-03-01',
        Time: '10:00 AM',
        Location: 'Conference Room A',
      },
      {
        Event: 'Client Presentation',
        Date: '2024-03-02',
        Time: '2:00 PM',
        Location: 'Virtual',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Excel to Calendar
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Import your events from Excel to Google Calendar in seconds
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <FileUpload onFileAccepted={handleFileAccepted} />
          
          {excelData.length > 0 && (
            <div className="space-y-4">
              <DataTable data={excelData} columns={columns} />
              
              <div className="flex justify-end">
                <Button className="space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Import to Calendar</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}