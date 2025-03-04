const ProVersion = () => {
  return (
    <>
      <div className="min-h-screen w-full flex justify-center">
        <div className=" w-full bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold ">Billing</h2>

          <div className="mb-4  max-w-80 p-2  ">
            <p className="text-gray-700">Messages Remaining</p>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-1 relative">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              10 of 10 messages remaining
            </p>
          </div>

          <div className="mb-4 mb-4 max-w-80 mb-10  p-2  pl-10 pr-10  bg-gray-100 rounded">
            <p className="text-gray-700 font-semibold">
              <i className="fas fa-credit-card"></i> Payment Method
            </p>
            <p className="text-red-500">No payment method set</p>
          </div>

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
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Upgrade to Starter ($19 / month)
            </button>
            <button className="bg-transparent text-black border-2 px-4 py-2 rounded w-full">
              Upgrade to Basic ($99 / month)
            </button>
            <button className="bg-transparent text-black border-2 px-4 py-2 rounded w-full">
              Upgrade to Turbo ($249 / month)
            </button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
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
            <button className="bg-blue-700 text-white px-4 py-2 rounded w-full">
              Upgrade to Basic ($83 / month)
            </button>
            <button className="bg-blue-700 text-white px-4 py-2 rounded w-full">
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
            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full">
              Purchase
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProVersion;
