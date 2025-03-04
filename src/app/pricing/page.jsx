import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

const page = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full flex justify-center">
        <div className=" w-full bg-white p-6 shadow-lg rounded-lg">
          <div className="mb-4 mb-10">
            <p className="text-gray-700 font-semibold">
              <i className="fas fa-info-circle"></i> Current Plan
            </p>
            <p className="text-gray-500">
              You currently do not have an active subscription plan.
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-2">View plan details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-[#0071BA] text-white px-4 py-2 rounded w-full">
              Upgrade to Starter ($19 / month)
            </button>
            <button className="bg-transparent text-black border-2 px-4 py-2 rounded w-full">
              Upgrade to Basic ($99 / month)
            </button>
            <button className="bg-transparent text-black border-2 px-4 py-2 rounded w-full">
              Upgrade to Turbo ($249 / month)
            </button>
            <button className="bg-[#0071BA] text-white px-4 py-2 rounded w-full">
              Upgrade to Pro ($499 / month)
            </button>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">
            Yearly (2 months off)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <button className="bg-transparent text-black border-2 px-4 py-2 rounded w-full">
              Upgrade to Starter ($17 / month)
            </button>
            <button className="bg-[#0071BA] text-white px-4 py-2 rounded w-full">
              Upgrade to Basic ($83 / month)
            </button>
            <button className="bg-[#0071BA] text-white px-4 py-2 rounded w-full">
              Upgrade to Turbo ($208 / month)
            </button>
            <button className="bg-transparent text-black border-2 px-4 py-2 rounded w-full">
              Upgrade to Pro ($417 / month)
            </button>
          </div>

          <div className="mt-6 p-4 bg-white-100 rounded mb-10">
            <h3 className="text-lg font-semibold">
              <i className="fas fa-building"></i> Enterprise Plan
            </h3>
            <p className="text-gray-600">
              Need more? Tell us about your needs.
            </p>
            <ul className="text-gray-700 mt-2 space-y-1">
              <li>Unlimited messages and storage capacity</li>
              <li>Priority Zoom support</li>
              <li>Custom Database integrations</li>
              <li>SOC2 Security</li>
              <li>Unlimited workflows</li>
            </ul>
            <button className="mt-4 bg-gray-700 text-white px-4 py-2 rounded w-full">
              Contact Sales
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded ">
            <h3 className="text-lg font-semibold">
              <i className="fas fa-plus-circle"></i> Add-Ons
            </h3>
            <p className="text-gray-700">Extra Message Credits</p>
            <p className="text-gray-600 text-sm">
              Add an extra 1000 messages for a one-time fee. This purchase is
              not recurring.
            </p>
            <p className="text-lg font-bold mt-2">$11.99</p>
            <button className="mt-2 bg-[#8BC541] text-white px-4 py-2 rounded w-full">
              Purchase
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default page;
