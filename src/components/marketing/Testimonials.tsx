const testimonials = [
  {
    quote: "We used to spend 3-4 hours calling carriers for each shipment. Now our AI handles it in 90 seconds. Game changer.",
    author: "Sarah Chen",
    role: "Logistics Manager",
    company: "TechDistro Inc.",
    avatar: "SC",
  },
  {
    quote: "23% average savings across 500+ shipments. The ROI was obvious after the first week. We never went back to manual calls.",
    author: "Marcus Johnson",
    role: "Supply Chain VP",
    company: "ManuCo Industries",
    avatar: "MJ",
  },
  {
    quote: "The transparency is incredible. I can watch every negotiation happen in real-time. It's like having 10 brokers working simultaneously.",
    author: "Emily Rodriguez",
    role: "Operations Director",
    company: "RetailCorp",
    avatar: "ER",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Logistics Leaders
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See why companies are switching to AI-powered freight negotiation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
