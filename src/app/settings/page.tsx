
'use client';

import { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, User, Settings as SettingsIcon, DownloadCloud, Loader2 } from 'lucide-react';
import { BottomNav } from '../dashboard/components/BottomNav';
import { ImportPreview } from './components/ImportPreview';
import { Category } from '../dashboard/types';

export default function SettingsPage() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [importData, setImportData] = useState<any[] | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setFile(file);
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch('/api/import', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setImportData(data.transactions);
            } else {
                alert("Erro ao ler arquivo.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar arquivo.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmImport = async (finalTransactions: any[]) => {
        setLoading(true);
        try {
            const res = await fetch('/api/import', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions: finalTransactions })
            });

            if (res.ok) {
                setSuccessMsg('Importação concluída com sucesso!');
                setImportData(null);
                setFile(null);
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                alert("Erro ao salvar transações.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05050f] text-white font-sans pb-32">
            <header className="p-6 pt-8 mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-indigo-500" />
                    Automação e Ajustes
                </h1>
                <p className="text-zinc-400 text-sm">Importe extratos e configure seu perfil</p>
            </header>

            <div className="max-w-3xl mx-auto px-6 space-y-8">

                {/* Profile Section (Stub) */}
                <section className="bg-[#121217] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-500" />
                        Perfil
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">KT</div>
                        <div>
                            <p className="font-bold">Kauan Taglioni</p>
                            <p className="text-zinc-400 text-sm">Plano Premium</p>
                        </div>
                    </div>
                </section>

                {/* Import Section */}
                <section className="bg-[#121217] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-blue-500" />
                        Importar Extrato
                    </h2>

                    {successMsg ? (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-5 h-5" />
                            {successMsg}
                        </div>
                    ) : !importData ? (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/20'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {loading ? (
                                <div className="space-y-4">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                                    <p className="text-zinc-400">Lendo arquivo e categorizando...</p>
                                </div>
                            ) : (
                                <>
                                    <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                                    <p className="text-lg font-medium mb-1">Arraste seu extrato aqui</p>
                                    <p className="text-sm text-zinc-500 mb-4">Suporta arquivos .OFX e .CSV (Nubank, Inter, Itaú)</p>

                                    <label className="inline-block px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                                        Selecionar Arquivo
                                        <input type="file" className="hidden" accept=".ofx,.csv" onChange={handleChange} />
                                    </label>
                                </>
                            )}
                        </div>
                    ) : (
                        <ImportPreview
                            transactions={importData}
                            categories={categories}
                            onCancel={() => { setImportData(null); setFile(null); }}
                            onConfirm={handleConfirmImport}
                        />
                    )}
                </section>

                {/* Export Section */}
                <section className="bg-[#121217] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <DownloadCloud className="w-5 h-5 text-green-500" />
                        Backup de Dados
                    </h2>
                    <p className="text-zinc-400 text-sm mb-4">
                        Baixe todos os seus dados (transações, orçamentos, cartões) em formato JSON.
                        Útil para migração ou segurança.
                    </p>
                    <button
                        onClick={() => window.open('/api/backup', '_blank')}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <DownloadCloud className="w-4 h-4" />
                        Exportar Tudo (JSON)
                    </button>
                </section>
            </div>

            <BottomNav onAddClick={() => { }} />
        </div>
    );
}
