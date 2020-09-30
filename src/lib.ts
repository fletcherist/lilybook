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

type Item = Note | Rest;
type GroupChildren = Group | Item;
interface Group {
  type: 'group';
  children: Array<GroupChildren>;
  modifier: Modifier;
}
interface GroupChord {
  type: 'group';
  modifier: 'chord';
  children: Note[];
}

export const note = (pitch: Pitch, duration: Duration): Note => {
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
  return { ...note, flat: true };
};

type DurationString = '1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';
// Rest is a pause by given duration
export const rest = (duration: DurationString): Rest => {
  const durationStringMap: Record<DurationString, Duration> = {
    '1': 1,
    '1/2': 2,
    '1/4': 4,
    '1/8': 8,
    '1/16': 16,
    '1/32': 32,
  };
  return { type: 'rest', duration: durationStringMap[duration] };
};

export const dot = (note: Note): Note => {
  return { ...note, dot: true };
  // `${note}.`
};

export const render = (group: Group): string => {
  const renderNote = (note: Item): string => {
    const renderPitch = (note: Note): string => {
      if (note.sharp) {
        return `${note.pitch}-sharp`;
      } else if (note.flat) {
        return `${note.pitch}-flat`;
      }
      return `${note.pitch}`;
    };
    const renderBeam = (note: Note): string | undefined => {
      if (note.beamStart) {
        return `(`;
      } else if (note.beamEnd) {
        return ')';
      }
      return undefined;
    };
    if (note.type === 'note') {
      return [renderPitch(note), note.duration, note.dot && `.`, renderBeam(note)]
        .filter(Boolean)
        .join('');
    } else if (note.type === 'rest') {
      return `r${note.duration}`;
    } else {
      throw new Error(`unexpected note type ${JSON.stringify(note)}`);
    }
  };

  const renderGroup = (group: Group) => {
    return group.children
      .map((item) => {
        if (item.type === 'group') {
          return render(item);
        } else {
          return renderNote(item);
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
  } else if (group.modifier === 'chord') {
    return `${renderGroup(group)}`;
  } else {
    throw new Error(`Group modifier ${group.modifier} is not supported`);
  }
};

const createGroup = (type: Modifier, ...children: GroupChildren[]): Group => {
  return {
    type: 'group',
    modifier: type,
    children: children,
  };
};

// group without modifiers
export const group = (...notes: GroupChildren[]): Group => {
  return createGroup('default', ...notes);
};

export const beam = (...notes: GroupChildren[]): Group => {
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

export const absolute = (...notes: GroupChildren[]): Group => {
  return createGroup('absolute', ...notes);
};

export const relative = (...notes: GroupChildren[]): Group => {
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
