const steps = [
  {
    number: "01",
    title: "Describe Your Shipment",
    description: "Enter your freight details - origin, destination, cargo type, and target price.",
  },
  {
    number: "02",
    title: "Select Providers",
    description: "Choose from 30+ verified trucking companies or let AI pick the best matches.",
  },
  {
    number: "03",
    title: "Watch AI Negotiate",
    description: "Our agents negotiate with all providers in parallel. Watch the conversation unfold in real-time.",
  },
  {
    number: "04",
    title: "Accept Best Deal",
    description: "Review all offers, see the savings, and accept the best deal with one click.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From shipment details to accepted deal in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50" />
              )}

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
