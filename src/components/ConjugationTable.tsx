import React from 'react';

interface ConjugationTableProps {
  title: string;
  data: Array<{
    pronoun: string;
    arabic: string;
    transliteration: string;
  }>;
}

export default function ConjugationTable({ title, data }: ConjugationTableProps) {
  return (
    <div className="clay-card p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
              <th className="border border-green-200 px-4 py-3 text-right font-semibold text-gray-700">
                Pronoun
              </th>
              <th className="border border-green-200 px-4 py-3 text-right font-semibold text-gray-700">
                Arabic
              </th>
              <th className="border border-green-200 px-4 py-3 text-left font-semibold text-gray-700">
                Transliteration
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-green-50 transition-colors">
                <td className="border border-green-200 px-4 py-3 text-right text-gray-700">
                  {row.pronoun}
                </td>
                <td className="border border-green-200 px-4 py-3 text-right text-2xl font-medium text-gray-800">
                  {row.arabic}
                </td>
                <td className="border border-green-200 px-4 py-3 text-left text-gray-600">
                  {row.transliteration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
