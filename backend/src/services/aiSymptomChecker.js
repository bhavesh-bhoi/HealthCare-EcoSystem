class AISymptomChecker {
  constructor() {
    this.symptomDatabase = {
      fever: {
        possibleCauses: [
          "Common Cold",
          "Influenza (Flu)",
          "COVID-19",
          "Bacterial Infection",
          "Urinary Tract Infection",
          "Malaria",
          "Dengue",
          "Typhoid",
        ],
        severityMatrix: {
          low: {
            temperature: "< 100°F",
            duration: "< 2 days",
            additional: "Mild, intermittent",
          },
          medium: {
            temperature: "100-102°F",
            duration: "2-4 days",
            additional: "Persistent",
          },
          high: {
            temperature: "> 102°F",
            duration: "> 4 days",
            additional: "High grade, with chills",
          },
        },
        recommendations: {
          low: "Rest, hydration, over-the-counter fever reducers",
          medium: "Consult doctor if persists > 3 days",
          high: "Immediate medical attention required",
        },
      },
      cough: {
        possibleCauses: [
          "Common Cold",
          "Acute Bronchitis",
          "Allergies",
          "Asthma",
          "GERD",
          "COVID-19",
          "Pneumonia",
          "Whooping Cough",
        ],
        severityMatrix: {
          low: { type: "Dry", duration: "< 3 days", frequency: "Occasional" },
          medium: {
            type: "Productive/Wet",
            duration: "3-7 days",
            frequency: "Frequent",
          },
          high: {
            type: "Severe/Bloody",
            duration: "> 7 days",
            frequency: "Persistent, breathing difficulty",
          },
        },
        recommendations: {
          low: "Warm fluids, honey, rest",
          medium: "Consult doctor, avoid triggers",
          high: "Emergency care if breathing difficulty",
        },
      },
      headache: {
        possibleCauses: [
          "Tension Headache",
          "Migraine",
          "Sinusitis",
          "Dehydration",
          "Eye Strain",
          "High Blood Pressure",
          "Cluster Headache",
          "Meningitis",
        ],
        severityMatrix: {
          low: {
            intensity: "Mild",
            duration: "< 4 hours",
            location: "Both sides",
          },
          medium: {
            intensity: "Moderate",
            duration: "4-24 hours",
            location: "Throbbing, one side",
          },
          high: {
            intensity: "Severe",
            duration: "> 24 hours",
            location: "Worst headache ever",
          },
        },
        recommendations: {
          low: "Rest, hydration, OTC pain relief",
          medium: "Dark room rest, consult if recurring",
          high: "Emergency if with fever, stiff neck",
        },
      },
      fatigue: {
        possibleCauses: [
          "Sleep Disorders",
          "Anemia",
          "Depression",
          "Thyroid Issues",
          "Chronic Fatigue Syndrome",
          "Diabetes",
          "Heart Disease",
          "Medication Side Effects",
        ],
        severityMatrix: {
          low: "Mild tiredness, improves with rest",
          medium: "Moderate fatigue, affects daily activities",
          high: "Severe exhaustion, unable to function",
        },
        recommendations: {
          low: "Improve sleep, exercise, diet",
          medium: "Consult doctor for underlying causes",
          high: "Immediate medical evaluation",
        },
      },
      nausea: {
        possibleCauses: [
          "Food Poisoning",
          "Viral Gastroenteritis",
          "Pregnancy",
          "Migraine",
          "Motion Sickness",
          "Medication Side Effects",
          "Acid Reflux",
          "Appendicitis",
        ],
        severityMatrix: {
          low: "Mild queasiness, no vomiting",
          medium: "Frequent nausea, occasional vomiting",
          high: "Persistent vomiting, unable to keep fluids down",
        },
        recommendations: {
          low: "Small sips of water, bland foods",
          medium: "Stay hydrated, consult if persists",
          high: "Emergency if severe dehydration",
        },
      },
      chestPain: {
        possibleCauses: [
          "Angina",
          "Heart Attack",
          "Acid Reflux",
          "Muscle Strain",
          "Anxiety",
          "Pleurisy",
          "Pulmonary Embolism",
          "Pericarditis",
        ],
        severityMatrix: {
          low: "Sharp pain with movement, not persistent",
          medium: "Dull ache, triggered by activity",
          high: "Crushing pain, radiating to arm/jaw, with shortness of breath",
        },
        recommendations: {
          low: "Monitor, rest, consult if recurring",
          medium: "Seek medical attention within 24 hours",
          high: "EMERGENCY - Call ambulance immediately",
        },
      },
      shortnessOfBreath: {
        possibleCauses: [
          "Asthma",
          "COPD",
          "Pneumonia",
          "Anxiety",
          "Heart Failure",
          "Pulmonary Embolism",
          "Allergic Reaction",
          "COVID-19",
        ],
        severityMatrix: {
          low: "Mild, with exertion only",
          medium: "Moderate, affects daily activities",
          high: "Severe, at rest, unable to speak full sentences",
        },
        recommendations: {
          low: "Monitor, avoid triggers",
          medium: "Consult doctor for evaluation",
          high: "EMERGENCY - Immediate medical attention",
        },
      },
      abdominalPain: {
        possibleCauses: [
          "Indigestion",
          "Gas",
          "Constipation",
          "Food Poisoning",
          "Appendicitis",
          "Gallstones",
          "Kidney Stones",
          "Ulcer",
        ],
        severityMatrix: {
          low: "Mild discomfort, localized",
          medium: "Moderate pain, intermittent",
          high: "Severe, constant, with fever/vomiting",
        },
        recommendations: {
          low: "Rest, avoid heavy meals",
          medium: "Consult if persists > 24 hours",
          high: "Emergency if severe, with rigidity",
        },
      },
      dizziness: {
        possibleCauses: [
          "Dehydration",
          "Low Blood Pressure",
          "Inner Ear Issues",
          "Anemia",
          "Medication Side Effects",
          "Heart Problems",
          "Stroke",
          "Vertigo",
        ],
        severityMatrix: {
          low: "Mild, occasional, with position change",
          medium: "Frequent, affects balance",
          high: "Severe, with fainting, speech problems",
        },
        recommendations: {
          low: "Hydrate, rise slowly",
          medium: "Consult doctor",
          high: "Emergency if with neurological symptoms",
        },
      },
      skinRash: {
        possibleCauses: [
          "Allergic Reaction",
          "Eczema",
          "Psoriasis",
          "Contact Dermatitis",
          "Infection",
          "Autoimmune Disorder",
          "Heat Rash",
          "Drug Reaction",
        ],
        severityMatrix: {
          low: "Mild, localized, not spreading",
          medium: "Spreading, itchy, uncomfortable",
          high: "With fever, blistering, breathing difficulty",
        },
        recommendations: {
          low: "Avoid triggers, moisturize",
          medium: "Consult dermatologist",
          high: "Emergency if with breathing difficulty",
        },
      },
    };

    this.commonSymptomPatterns = {
      viralFever: ["fever", "fatigue", "bodyAche"],
      coldAndFlu: ["cough", "soreThroat", "runnyNose"],
      migraine: ["headache", "nausea", "sensitivityToLight"],
      gastroenteritis: ["nausea", "abdominalPain", "diarrhea"],
      allergicReaction: ["skinRash", "itching", "shortnessOfBreath"],
      covid19: ["fever", "cough", "lossOfTasteSmell", "fatigue"],
      dehydration: ["dizziness", "dryMouth", "fatigue", "headache"],
      anxiety: ["chestPain", "shortnessOfBreath", "dizziness", "palpitations"],
    };

    this.emergencySymptoms = [
      "chestPain",
      "shortnessOfBreath",
      "severeHeadache",
      "unconsciousness",
      "seizure",
      "severeBleeding",
      "difficultySpeaking",
      "paralysis",
    ];
  }

  analyzeSymptoms(symptoms, patientData = null) {
    const results = [];
    let overallSeverity = "low";
    let severityScore = 0;
    const detectedPatterns = [];
    const emergencyIndicators = [];

    // Analyze each symptom
    symptoms.forEach((symptom) => {
      const analysis = this.analyzeSingleSymptom(symptom);
      results.push(analysis);

      // Calculate severity score
      if (analysis.severity === "high") severityScore += 3;
      else if (analysis.severity === "medium") severityScore += 2;
      else severityScore += 1;

      // Check for emergency symptoms
      if (this.emergencySymptoms.includes(symptom.name.toLowerCase())) {
        emergencyIndicators.push(symptom.name);
      }
    });

    // Detect symptom patterns
    detectedPatterns.push(...this.detectPatterns(symptoms));

    // Adjust for patient risk factors
    if (patientData) {
      severityScore = this.adjustForPatientRisk(severityScore, patientData);
    }

    // Determine overall severity
    if (emergencyIndicators.length > 0) {
      overallSeverity = "high";
    } else if (severityScore >= 8) {
      overallSeverity = "high";
    } else if (severityScore >= 4) {
      overallSeverity = "medium";
    }

    // Get recommendations
    const recommendations = this.getRecommendations(
      overallSeverity,
      symptoms,
      detectedPatterns,
    );

    // Get possible causes
    const possibleCauses = this.getPossibleCauses(symptoms, detectedPatterns);

    return {
      symptoms: results,
      overallSeverity,
      severityScore,
      possibleCauses,
      recommendations,
      detectedPatterns,
      emergencyIndicators,
      urgencyLevel: this.getUrgencyLevel(overallSeverity),
      requiresEmergency: emergencyIndicators.length > 0,
      disclaimer:
        "This is an AI-assisted analysis and not a medical diagnosis. Always consult with a healthcare professional.",
    };
  }

  analyzeSingleSymptom(symptom) {
    const { name, duration, intensity, temperature, frequency } = symptom;
    const symptomData = this.symptomDatabase[name.toLowerCase()];

    if (!symptomData) {
      return {
        name,
        severity: "low",
        notes: "This symptom requires professional medical evaluation",
        recommendations: "Consult a doctor for proper diagnosis",
      };
    }

    let severity = "low";
    let notes = "";

    // Severity logic based on symptom parameters
    if (name === "fever" && temperature) {
      if (temperature > 102) {
        severity = "high";
        notes = "High fever requiring medical attention";
      } else if (temperature > 100) {
        severity = "medium";
        notes = "Moderate fever, monitor regularly";
      }
    } else if (name === "cough") {
      if (duration > 7) {
        severity = "high";
        notes = "Persistent cough needs evaluation";
      } else if (duration > 3) {
        severity = "medium";
        notes = "Monitor for changes";
      }
    } else if (name === "headache") {
      if (duration > 24 || intensity === "severe") {
        severity = "high";
        notes = "Severe headache requires attention";
      } else if (duration > 4 || intensity === "moderate") {
        severity = "medium";
        notes = "Moderate headache, rest recommended";
      }
    } else if (name === "chestPain" || name === "shortnessOfBreath") {
      severity = "high";
      notes = "Potential emergency - seek immediate care";
    }

    return {
      name,
      severity,
      possibleCauses: symptomData?.possibleCauses?.slice(0, 3) || [],
      notes:
        notes || symptomData?.recommendations[severity] || "Monitor symptoms",
      recommendations:
        symptomData?.recommendations[severity] || "Consult doctor if persists",
    };
  }

  detectPatterns(symptoms) {
    const patterns = [];
    const symptomNames = symptoms.map((s) => s.name.toLowerCase());

    for (const [pattern, patternSymptoms] of Object.entries(
      this.commonSymptomPatterns,
    )) {
      const matchCount = patternSymptoms.filter((s) =>
        symptomNames.includes(s),
      ).length;
      if (matchCount >= patternSymptoms.length * 0.6) {
        // 60% match threshold
        patterns.push({
          pattern,
          confidence: matchCount / patternSymptoms.length,
          matchedSymptoms: patternSymptoms.filter((s) =>
            symptomNames.includes(s),
          ),
        });
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  adjustForPatientRisk(severityScore, patientData) {
    // Age factor
    if (patientData.age > 65) severityScore += 3;
    else if (patientData.age > 50) severityScore += 2;
    else if (patientData.age < 5) severityScore += 2;

    // Pre-existing conditions
    if (
      patientData.chronicConditions &&
      patientData.chronicConditions.length > 0
    ) {
      const highRiskConditions = [
        "diabetes",
        "heart disease",
        "copd",
        "cancer",
        "kidney disease",
      ];
      patientData.chronicConditions.forEach((condition) => {
        if (highRiskConditions.includes(condition.toLowerCase())) {
          severityScore += 2;
        }
      });
    }

    // Pregnancy
    if (patientData.isPregnant) {
      severityScore += 3;
    }

    // Immunocompromised
    if (patientData.isImmunocompromised) {
      severityScore += 3;
    }

    return severityScore;
  }

  getPossibleCauses(symptoms, patterns) {
    const causes = new Set();

    // Add causes from patterns
    patterns.forEach((pattern) => {
      if (pattern.pattern === "viralFever") {
        ["Viral Infection", "Influenza", "COVID-19"].forEach((c) =>
          causes.add(c),
        );
      } else if (pattern.pattern === "coldAndFlu") {
        ["Common Cold", "Influenza", "Allergies"].forEach((c) => causes.add(c));
      } else if (pattern.pattern === "gastroenteritis") {
        [
          "Food Poisoning",
          "Viral Gastroenteritis",
          "Bacterial Infection",
        ].forEach((c) => causes.add(c));
      }
    });

    // Add causes from individual symptoms
    symptoms.forEach((symptom) => {
      const symptomData = this.symptomDatabase[symptom.name.toLowerCase()];
      if (symptomData) {
        symptomData.possibleCauses
          .slice(0, 2)
          .forEach((cause) => causes.add(cause));
      }
    });

    return Array.from(causes).slice(0, 5);
  }

  getRecommendations(severity, symptoms, patterns) {
    const recommendations = [];

    if (severity === "high") {
      recommendations.push("🚨 IMMEDIATE MEDICAL ATTENTION REQUIRED");
      recommendations.push(
        "Call emergency services (911/112) or go to nearest ER",
      );
      recommendations.push("Do not wait for symptoms to improve");
    } else if (severity === "medium") {
      recommendations.push("Schedule a doctor appointment within 24 hours");
      recommendations.push("Monitor symptoms and keep a log");
      recommendations.push("Rest and stay hydrated");
      recommendations.push("Avoid self-medication without consultation");
    } else {
      recommendations.push("Monitor symptoms at home");
      recommendations.push(
        "Consult doctor if symptoms worsen or persist beyond 3 days",
      );
      recommendations.push(
        "Maintain healthy lifestyle: rest, hydration, proper nutrition",
      );
    }

    // Pattern-specific recommendations
    patterns.forEach((pattern) => {
      if (pattern.pattern === "viralFever") {
        recommendations.push(
          "🦠 Possible viral infection - isolate to prevent spread",
        );
      } else if (pattern.pattern === "dehydration") {
        recommendations.push(
          "💧 Increase fluid intake, consider oral rehydration salts",
        );
      } else if (pattern.pattern === "anxiety") {
        recommendations.push(
          "🧘 Practice deep breathing and stress management techniques",
        );
      }
    });

    return recommendations;
  }

  getUrgencyLevel(severity) {
    const urgencyMap = {
      high: "🚨 EMERGENCY - Immediate care needed",
      medium: "⚠️ URGENT - See doctor within 24 hours",
      low: "✅ ROUTINE - Monitor at home",
    };
    return urgencyMap[severity] || urgencyMap.low;
  }
}

export default new AISymptomChecker();
