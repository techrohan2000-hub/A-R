import type { WeddingWorkspace } from "../types/wedding";
import couplePhoto from "../assets/rohan-aishwarya.jpg";

// Realistic demo data so the app never looks empty on first launch.
// Clearly flagged via isSampleData so the UI can offer "Start Fresh".
const today = new Date();
const daysFromNow = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const sampleWorkspace: WeddingWorkspace = {
  wedding: {
    id: "sample-wedding-1",
    isSampleData: true,
    couple: {
      groomName: "Rohan",
      brideName: "Aishwarya",
      couplePhotoUrl: couplePhoto,
      weddingDate: daysFromNow(72),
      weddingTime: "08:30",
      weddingVenue: "Shreeram Mangal Karyalaya",
      city: "Pune",
      hashtag: "#RohanWedsAishwarya",
    },
    tradition: {
      region: "Maharashtra",
      familyTradition: "maharashtrian",
      communityNote: "Deshastha Brahmin",
      brideFamilyCustoms: "Simple Ganesh Puja followed by Seemantapoojan",
      groomFamilyCustoms: "Grah Shanti performed a day before Baraat",
      language: "Marathi & English",
      foodPreference: "vegetarian",
    },
    planning: {
      currency: "INR",
      totalBudget: 2500000,
      expectedGuestCount: 320,
      planningStartDate: daysFromNow(-150),
      engagementDate: daysFromNow(-40),
    },
    events: [
      { id: "evt-engagement", name: "Engagement", date: daysFromNow(-40), enabled: true },
      { id: "evt-haldi", name: "Haldi", date: daysFromNow(70), enabled: true },
      { id: "evt-mehendi", name: "Mehendi", date: daysFromNow(70), enabled: true },
      { id: "evt-sangeet", name: "Sangeet", date: daysFromNow(71), enabled: true },
      { id: "evt-grahshanti", name: "Grah Shanti", date: daysFromNow(71), enabled: true },
      { id: "evt-wedding", name: "Wedding Ceremony", date: daysFromNow(72), enabled: true },
      { id: "evt-reception", name: "Reception", date: daysFromNow(73), enabled: true },
      { id: "evt-grihapravesh", name: "Griha Pravesh", date: daysFromNow(80), enabled: true },
    ],
    family: [
      { id: "f1", name: "Suresh Kulkarni", relation: "Father", side: "groom", isCoordinator: true, phone: "+91 98200 11111" },
      { id: "f2", name: "Meena Kulkarni", relation: "Mother", side: "groom" },
      { id: "f3", name: "Anand Deshpande", relation: "Father", side: "bride", isCoordinator: true, phone: "+91 98200 22222" },
      { id: "f4", name: "Shalini Deshpande", relation: "Mother", side: "bride" },
      { id: "f5", name: "Neha Kulkarni", relation: "Sister", side: "groom", isCoordinator: true },
    ],
    onboardingComplete: true,
    createdAt: daysFromNow(-150),
    updatedAt: daysFromNow(0),
  },
  tasks: [
    { id: "t1", title: "Finalize caterer menu tasting", category: "Food", responsible: "Shalini Deshpande", dueDate: daysFromNow(3), priority: "high", status: "in-progress" },
    { id: "t2", title: "Confirm mandap decoration concept", category: "Decoration", responsible: "Neha Kulkarni", dueDate: daysFromNow(5), priority: "medium", status: "not-started" },
    { id: "t3", title: "Collect bride's wedding saree from tailor", category: "Shopping", responsible: "Aishwarya", dueDate: daysFromNow(-2), priority: "critical", status: "not-started" },
    { id: "t4", title: "Pay photographer advance", category: "Vendors", responsible: "Suresh Kulkarni", dueDate: daysFromNow(2), priority: "critical", status: "not-started" },
    { id: "t5", title: "Send digital invites to Pune guest list", category: "Invitations", responsible: "Rohan", dueDate: daysFromNow(1), priority: "high", status: "in-progress" },
    { id: "t6", title: "Book return-gift packaging vendor", category: "Gifts", responsible: "Neha Kulkarni", dueDate: daysFromNow(10), priority: "low", status: "not-started" },
    { id: "t7", title: "Finalize Haldi outfit for groom", category: "Outfits", responsible: "Rohan", dueDate: daysFromNow(15), priority: "medium", status: "completed" },
    { id: "t8", title: "Confirm hotel block for out-of-town guests", category: "Travel", responsible: "Anand Deshpande", dueDate: daysFromNow(6), priority: "high", status: "in-progress" },
  ],
  budget: [
    { id: "b1", category: "Venue", estimated: 400000, paid: 200000 },
    { id: "b2", category: "Catering", estimated: 600000, paid: 150000 },
    { id: "b3", category: "Decoration", estimated: 250000, paid: 50000 },
    { id: "b4", category: "Photography", estimated: 180000, paid: 90000 },
    { id: "b5", category: "Jewellery", estimated: 500000, paid: 500000 },
    { id: "b6", category: "Outfits", estimated: 300000, paid: 220000 },
    { id: "b7", category: "Priest & Rituals", estimated: 60000, paid: 20000 },
    { id: "b8", category: "Miscellaneous", estimated: 210000, paid: 40000 },
  ],
  guests: [
    { id: "g1", name: "Deshpande Family (Nashik)", side: "bride", rsvp: "confirmed", accommodationRequired: true },
    { id: "g2", name: "Kulkarni Family (Mumbai)", side: "groom", rsvp: "confirmed", accommodationRequired: true },
    { id: "g3", name: "Joshi Family", side: "bride", rsvp: "invited", accommodationRequired: false },
    { id: "g4", name: "Patwardhan Family", side: "groom", rsvp: "maybe", accommodationRequired: true },
    { id: "g5", name: "Office Colleagues - Rohan", side: "groom", rsvp: "not-contacted", accommodationRequired: false },
    { id: "g6", name: "College Friends - Aishwarya", side: "bride", rsvp: "declined", accommodationRequired: false },
  ],
  vendors: [
    { id: "v1", name: "Shubh Mangal Caterers", category: "Caterer", status: "booked", totalAmount: 600000, paidAmount: 150000, dueDate: daysFromNow(20) },
    { id: "v2", name: "Pixel Tales Photography", category: "Photographer", status: "booked", totalAmount: 180000, paidAmount: 90000, dueDate: daysFromNow(5) },
    { id: "v3", name: "Floral Fantasy Decor", category: "Decorator", status: "negotiating", totalAmount: 250000, paidAmount: 0, dueDate: daysFromNow(12) },
    { id: "v4", name: "Pandit Ramesh Joshi", category: "Priest", status: "booked", totalAmount: 41000, paidAmount: 20000, dueDate: daysFromNow(30) },
    { id: "v5", name: "DJ Sunny Beats", category: "DJ", status: "shortlisted", totalAmount: 80000, paidAmount: 0 },
  ],
  shopping: [
    { id: "s1", item: "Wedding saree", forWhom: "Aishwarya", purchased: true, packed: false },
    { id: "s2", item: "Sherwani", forWhom: "Rohan", purchased: true, packed: false },
    { id: "s3", item: "Mangal Sutra", forWhom: "Aishwarya", purchased: true, packed: true },
    { id: "s4", item: "Return gift boxes (200 units)", forWhom: "Wedding", purchased: false, packed: false },
    { id: "s5", item: "Haldi outfit set", forWhom: "Family", purchased: false, packed: false },
    { id: "s6", item: "Puja samagri kit", forWhom: "Wedding", purchased: false, packed: false },
  ],
  milestones: [
    { id: "m1", title: "Fix wedding venue", date: daysFromNow(-90), notes: "Booked Shreeram Mangal Karyalaya", completed: true },
    { id: "m2", title: "Book photographer & videographer", date: daysFromNow(-60), completed: true },
    { id: "m3", title: "Finalize catering menu", date: daysFromNow(3), notes: "Tasting scheduled", completed: false },
    { id: "m4", title: "Send out invitations", date: daysFromNow(10), completed: false },
    { id: "m5", title: "Final guest count to caterer", date: daysFromNow(50), completed: false },
    { id: "m6", title: "Collect outfits & jewellery", date: daysFromNow(68), completed: false },
  ],
};
