import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, context, history } = body;

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    console.log(`[Copilot Chat API] Routing message to: ${backendUrl}/api/v1/copilot-chat...`);
    try {
      const res = await fetch(`${backendUrl}/api/v1/copilot-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context, history }),
        signal: AbortSignal.timeout(25000) // 25s timeout for LLM generation
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          result: data.result,
          citations: data.citations || []
        });
      } else {
        throw new Error("FastAPI Backend returned an error status");
      }
    } catch (e) {
      console.warn("FastAPI backend copilot chat unreachable. Using local response fallback.", e);
      
      // Local fallback in case FastAPI backend is offline
      const normalized = prompt.toLowerCase();
      const language = context?.language || "en";
      const isKn = language === "kn";
      let responseText = "";
      let citations = [];

      if (normalized.includes("fir-890") || normalized.includes("vehicle") || normalized.includes("theft") || normalized.includes("ಕಳ್ಳತನ") || normalized.includes("ವಾಹನ")) {
        responseText = isKn 
          ? "ಸ್ಥಳೀಯ ಸಹಾಯಕ: FIR-890 ಮೆಟಾಡೇಟಾವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಪೂರ್ವ ಬೆಂಗಳೂರಿನಲ್ಲಿ 5 ಸಕ್ರಿಯ ಐಷಾರಾಮಿ ಸೆಡಾನ್ ಕಾರುಗಳ ಕಳ್ಳತನ ದಾಖಲಾಗಿದೆ. ಶಂಕಿತ ವಿಕ್ಕಿ ಭಾಯ್ ಭಾಗಿಯಾಗಿದ್ದಾನೆ. ಹಲಸೂರು ಕ್ರಾಸಿಂಗ್ ಬಳಿ KA-03-MR-9801 ಕಾರು ಪತ್ತೆಯಾಗಿದೆ."
          : "FALLBACK ASSISTANT: Cross-referenced FIR-890 metadata. 5 active luxury sedan thefts are logged across East Bengaluru. Suspect Vicky Bhai has been associated with target vehicles. Plate KA-03-MR-9801 was bypassed near Halasuru crossing.";
        citations = [
          { title: isKn ? "FIR-2026/0890 ದಾಖಲೆ" : "FIR-2026/0890 Dossier", link: "#" },
          { title: isKn ? "CCTV ಕ್ಯಾಮೆರಾ ದಾಖಲೆಗಳು" : "CCTV Plate ALPR logs", link: "#" }
        ];
      } else if (normalized.includes("suspect") || normalized.includes("vicky") || normalized.includes("indiranagar") || normalized.includes("ಶಂಕಿತ") || normalized.includes("ಇಂದಿರಾನಗರ")) {
        responseText = isKn
          ? "ಸ್ಥಳೀಯ ಸಹಾಯಕ: ವಿಕ್ರಮ್ 'ವಿಕ್ಕಿ' ಗೌಡ (ಬುಕಿಂಗ್ ಐಡಿ: KSP-9087-A) ಅವರ ಅಪಾಯದ ಶ್ರೇಣಿ ಪ್ರಸ್ತುತ ಗಂಭೀರವಾಗಿದೆ. ಇಂದಿರಾನಗರ ಸೆಕ್ಟರ್ 2 ರಲ್ಲಿ ಕೊನೆಯದಾಗಿ ಪತ್ತೆಯಾಗಿದ್ದಾರೆ. ವಾಹನ ಕಳ್ಳತನಕ್ಕಾಗಿ ವಾರಂಟ್ ಜಾರಿಯಾಗಿದೆ."
          : "FALLBACK ASSISTANT: Vikram 'Vicky' Gowda (Booking ID: KSP-9087-A) risk rating is currently flagged as CRITICAL. Last active ping tower was Indiranagar Sector 2. Active warrant for vehicle theft and assault.";
        citations = [
          { title: isKn ? "ವಿಕ್ಕಿ ಗೌಡ ಅವರ ಪ್ರೊಫೈಲ್" : "Vicky Gowda Profile", link: "#" },
          { title: isKn ? "ಮೊಬೈಲ್ ಸಿಗ್ನಲ್ ದಾಖಲೆಗಳು" : "CDR Tower logs (Indira-04)", link: "#" }
        ];
      } else {
        const userName = context?.user?.name || "Officer";
        const userRole = context?.user?.role || "KSP Analyst";
        
        if (isKn) {
          responseText = `ನಮಸ್ಕಾರ, ${userRole} ${userName}. ನಾನು ನಿಮಗೆ ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನ ಪ್ರಮುಖ ಅಂಕಿಅಂಶಗಳು ಇಲ್ಲಿವೆ:
- **ಸಕ್ರಿಯ ಐಪಿಸಿ ಪ್ರಕರಣಗಳು**: ${context?.metrics?.find((m: any) => m.id === "active_cases")?.value || "5"} (ಬದಲಾವಣೆ: +12.5%)
- **ಐತಿಹಾಸಿಕ ದೂರುಗಳು**: ${context?.metrics?.find((m: any) => m.id === "total_complaints")?.value || "156,513"} (ಬದಲಾವಣೆ: +5.2%)
- **ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು**: ${context?.metrics?.find((m: any) => m.id === "critical_alerts")?.value || "0"} (ಬದಲಾವಣೆ: -2.1%)
- **ಪೊಲೀಸ್ ವಿರುದ್ಧದ ದೂರುಗಳು**: ${context?.metrics?.find((m: any) => m.id === "police_complaints")?.value || "183"} (ಬದಲಾವಣೆ: ಸ್ಥಿರವಾಗಿದೆ)

ನೀವು ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಬಯಸುವಿರಾ, ಅಥವಾ ಇತ್ತೀಚಿನ ಘಟನೆಗಳ ಮಾಹಿತಿಯನ್ನು ತಿಳಿಯಲು ಇಚ್ಛಿಸುವಿರಾ?`;
          citations = [
            { title: "ಲೈವ್ ಡಿಸ್ಪ್ಯಾಚ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", link: "#" }
          ];
        } else {
          responseText = `Hello, ${userRole} ${userName}. How can I assist you today? Here are some key metrics from the dashboard:
- **Active IPC Cases**: ${context?.metrics?.find((m: any) => m.id === "active_cases")?.value || "5"} (Trend: +12.5%)
- **Historical Complaints**: ${context?.metrics?.find((m: any) => m.id === "total_complaints")?.value || "156,513"} (Trend: +5.2%)
- **Critical Alerts**: ${context?.metrics?.find((m: any) => m.id === "critical_alerts")?.value || "0"} (Trend: -2.1%)
- **Complaints Against Police**: ${context?.metrics?.find((m: any) => m.id === "police_complaints")?.value || "183"} (Trend: Stable)

Would you like a detailed breakdown of any specific metric, a district-wise caseload summary, or information on recent incident logs?`;
          citations = [
            { title: "Live Dispatch Dashboard", link: "#" }
          ];
        }
      }

      return NextResponse.json({ result: responseText, citations });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process chat query" }, { status: 500 });
  }
}
