export const generateOctaves = (octaveCount, baseScale) =>
  Array.from({ length: octaveCount }, (_, i) => i + 1).flatMap((octave) =>
    baseScale.map((note) => (note === "C" ? note + octave : note))
  );
