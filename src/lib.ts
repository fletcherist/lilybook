type Pitch = 'c' | 'd' | 'e' | 'f' | 'g' | 'a' | 'b';
type Duration = 1 | 2 | 4 | 8 | 16 | 32;
type Time = '4/4' | '3/4';
type NestedArray = Array<Note | Note[]>;

interface Note {
  type: 'note';
  pitch: Pitch;
  duration: Duration;

  sharp?: boolean;
  flat?: boolean;
  dot?: boolean;
  beamStart?: boolean;
  beamEnd?: boolean;
}

interface Rest {
  type: 'rest';
  duration: Duration;
}

interface Group {
  type: 'group';
  children: Array<Note | Group>;
}

export const note = (pitch: Pitch, duration: Duration): Note => {
  // if (duration) {
  //   return `${pitch}${duration}`;
  // }
  // return pitch;
  return { type: 'note', pitch, duration };
};
export const note2 = (pitch: Pitch): Note => note(pitch, 2);
export const note4 = (pitch: Pitch): Note => note(pitch, 4);
export const note8 = (pitch: Pitch): Note => note(pitch, 8);
export const note16 = (pitch: Pitch): Note => note(pitch, 16);
// @todo: add double sharp
export const sharp = (note: Note): Note => {
  return { ...note, sharp: true };
};
// @todo: add double flat
export const flat = (note: Note): Note => {
  // return `${note}/-flat`;
  return { ...note, flat: true };
};

// Rest is a pause by given duration
export const rest = (duration: Duration): Rest => {
  // return `r${duration}`;
  return { type: 'rest', duration };
};

export const dot = (note: Note): Note => {
  return { ...note, dot: true };
  // `${note}.`
};

// export const beam = (...notes: string[]): string[] => {
//   return notes.map((note, index) => {
//     const isFirstNote = index === 0;
//     const isLastNote = index === notes.length - 1;
//     if (isFirstNote) {
//       return `${note}(`;
//     } else if (isLastNote) {
//       return `${note})`;
//     }
//     return note;
//   });
// };
export const beam = (...notes: Note[]): Note[] => {
  return notes.map((note, index) => {
    const isFirstNote = index === 0;
    const isLastNote = index === notes.length - 1;
    if (isFirstNote) {
      // return `${note}(`;
      return { ...note, beamStart: true };
    } else if (isLastNote) {
      // return `${note})`;
      return { ...note, beamEnd: true };
    }
    return note;
  });
};

const render = (...notes: Note[]): string => {
  const renderPitch = (note: Note): string => {
    if (note.sharp) {
      return `${note.pitch}/-sharp`;
    } else if (note.flat) {
      return `${note.pitch}/-flat`;
    }
    return `${note.pitch}`;
  };
  const renderBeam = (note: Note): string => {
    if (note.beamStart) {
      return `(`;
    } else if (note.beamEnd) {
      return ')';
    }
    return '';
  };
  return notes
    .map((note) => {
      return [renderPitch(note), note.duration, renderBeam(note)].filter(Boolean).join('');
    })
    .join(' ');
};

export const absolute = (...notes: NestedArray): string => {
  return `\\absolute { ${render(...notes.flat())} }`;
};

export const relative = (...notes: NestedArray): string => {
  return `\\relative { ${render(...notes.flat())} }`;
};

export const group = (...notes: NestedArray): string => {
  return render(...notes.flat());
};

export const chord = (...notes: NestedArray): string => {
  return `<${notes.flat().join(' ')}>`;
};

export const staff = (
  options: {
    clef: 'treble' | 'bass';
    time: Time;
    key: [Pitch, 'major' | 'minor'];
  },
  notes: string[]
) => {
  const [pitch, scale] = options.key;
  return `\\new Staff {
        \\clef ${options.clef}
        \\time ${options.time}
        \\key ${pitch} \\${scale}
        \\relative c' { ${notes.join(' ')} }
    }`;
};
