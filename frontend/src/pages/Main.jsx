import React from "react";
import background from "../assets/background.png";
import MainNavbar from "../components/layouts/MainNavbar";
import Footer from "../components/layouts/Footer";

function Main() {
  return (
    <div>
      <MainNavbar />
      <div
        id="home"
        className="flex flex-col md:flex-row items-center justify-between bg-[#009DA2] text-white px-6 md:px-12 lg:px-20 pt-24 pb-16 md:pt-36 md:pb-20"
      >
        {/* Left */}
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Don’t Delay
            <br />
            Jobber Today
          </h1>
          {/* <p className="italic font-semibold text-lg mb-6">
            FASTER | SMARTER | BETTER
          </p> */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="#about" className="w-full sm:w-auto">
              <button className="bg-white text-[#005270] font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition w-full sm:w-auto">
                {" "}
                Learn More ↓
              </button>
            </a>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <button className="bg-white text-[#005270] font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition w-full sm:w-auto">
                How It Works ↓
              </button>
            </a>
          </div>
        </div>
        {/* Right */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img
            src={background}
            alt="main-image"
            className="w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] animate-fadeInUp"
          />
        </div>
      </div>

      {/* about */}
      <section
        id="about"
        className="px-6 md:px-10 lg:px-16 py-16 md:py-20 bg-gray-100 text-[#007998] text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">What is Jobber?</h2>
        <p className="max-w-xl md:max-w-3xl mx-auto text-base md:text-lg mb-12">
          Jobber is a next-gen platform built to connect job seekers and
          employers. Whether you're looking for talent or chasing your dream
          job, Jobber assists with the process using smart technology and
          intuitive design.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg md:text-xl font-semibold mb-3">
              🚀 Matching
            </h3>
            <p className="text-sm md:text-base">
              Jobber instantly matches candidates with suitable roles, saving
              both time and effort.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg md:text-xl font-semibold mb-3">🤝 Hiring</h3>
            <p className="text-sm md:text-base">
              Employers can post jobs, review applicants, and communicate
              easily, creating a better hiring experience for everyone.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-6 md:px-10 lg:px-16 py-16 md:py-20 bg-[#009DA2] text-white text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-[#005270] max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto">
          <div className="p-6 rounded-lg shadow hover:shadow-xl bg-white transition">
            <h3 className="text-lg md:text-xl font-semibold mb-3">
              📝 Create Your Profile
            </h3>
            <p className="text-sm md:text-base">
              Create your account quickly and upload your latest resume. Our
              system processes it to extract key information.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow hover:shadow-xl transition bg-white">
            <h3 className="text-lg md:text-xl font-semibold mb-3">
              🔍 Discover Opportunities
            </h3>
            <p className="text-sm md:text-base">
              Browse relevant job openings posted by companies. Your processed
              resume makes applying straightforward.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow hover:shadow-xl transition bg-white">
            <h3 className="text-lg md:text-xl font-semibold mb-3">
              📩 Apply & Connect
            </h3>
            <p className="text-sm md:text-base">
              Easily apply to positions that interest you using your uploaded
              resume.
              <br />
              Manage applications and connect with potential employers.
            </p>
          </div>
        </div>
      </section>

      {/* <section
        id="testimonials"
        className="px-6 md:px-10 lg:px-16 py-16 md:py-20 bg-gray-100 text-[#005270] text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          What Our Users Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-lg md:max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="italic text-sm md:text-base">
              “Jobber helped me land my dream job in less than a week. The
              platform is super easy to use!”
            </p>
            <h4 className="mt-4 font-semibold text-teal-700 text-sm md:text-base">
              – Sarah J., UX Designer
            </h4>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="italic text-sm md:text-base">
              “As an employer, finding qualified candidates has never been this
              fast and efficient.”
            </p>
            <h4 className="mt-4 font-semibold text-teal-700 text-sm md:text-base">
              – Daniel R., Recruiter
            </h4>
          </div>
        </div>
      </section> */}

      {/* contact */}
      <section
        id="contact"
        className="px-6 md:px-10 py-16 md:py-20 bg-gray-100 text-[#007998] text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
        <p className="text-base md:text-lg mb-8 max-w-xl mx-auto">
          Have questions or feedback? We'd love to hear from you!
        </p>

        <form className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full space-y-6 text-[#009DA2]">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            //   value={formData.name}
            //   onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            //   value={formData.email}
            //   onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
            required
          />

          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            //   value={formData.message}
            //   onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
            required
          />

          <button
            type="submit"
            className="bg-white text-[#007998] font-semibold px-8 py-3 rounded shadow hover:bg-[#007998] hover:text-white transition w-full sm:w-auto"
          >
            Send Message
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}

export default Main;
