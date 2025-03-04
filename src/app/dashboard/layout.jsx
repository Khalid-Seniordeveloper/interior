import Sidebar from "../../components/sidebar/sidebar";

export default function CompanyLayout({ children }) {
  return (
    <>
      <div className="flex w-full sm:w-full">
        <Sidebar />
        <main className="flex-1 bg-[#FBFCFD] w-full p-4 sm:ml-64">
          {children}
        </main>
      </div>
    </>
  );
}
