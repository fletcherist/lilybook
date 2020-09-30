type Pitch = 'c' | 'd' | 'e' | 'f' | 'g' | 'a' | 'b';
type Duration = 1 | 2 | 4 | 8 | 16 | 32;
type Time = '4/4' | '3/4';

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

type Modifier = 'default' | 'beam' | 'chord' | 'absolute' | 'relative';

type Item = Group | Note | Rest;
interface Group {
  type: 'group';
  children: Array<Note | Group | Rest>;
  modifier: Modifier;
}
interface GroupChord {
  type: 'group';
  modifier: 'chord';
  children: Note[];
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

export const render = (group: Group): string => {
  const renderNote = (note: Note): string => {
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
    return [renderPitch(note), note.duration, renderBeam(note)].filter(Boolean).join('');
  };

  const renderGroup = (group: Group) => {
    return group.children
      .map((item) => {
        if (item.type === 'note') {
          return renderNote(item);
        } else if (item.type === 'group') {
          return render(item);
        }
      })
      .join(' ');
  };

  if (group.modifier === 'default') {
    return `${renderGroup(group)}`;
  } else if (group.modifier === 'absolute') {
    return `\\absolute { ${renderGroup(group)} }`;
  } else if (group.modifier === 'relative') {
    return `\\relative { ${renderGroup(group)} }`;
  } else if (group.modifier === 'beam') {
    return `${renderGroup(group)}`;
  } else {
    throw new Error(`Group modifier ${group.modifier} is not supported`);
  }
};

const createGroup = (type: Modifier, ...children: Item[]): Group => {
  return {
    type: 'group',
    modifier: type,
    children: children,
  };
};

// group without modifiers
export const group = (...notes: Item[]): Group => {
  return createGroup('default', ...notes);
};

export const beam = (...notes: Item[]): Group => {
  const beamNotes = notes.map((note, index) => {
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
  return {
    type: 'group',
    children: beamNotes,
    modifier: 'beam',
  };
};

export const absolute = (...notes: Item[]): Group => {
  return createGroup('absolute', ...notes);
};

export const relative = (...notes: Item[]): Group => {
  return createGroup('relative', ...notes);
};

export const chord = (...notes: Note[]): Group => {
  // return `<${notes.flat().join(' ')}>`;
  return createGroup('chord', ...notes);
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
