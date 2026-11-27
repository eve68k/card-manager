export type EventFormData = { name: string; date: string; place: string };

export const emptyEventForm: EventFormData = { name: "", date: "", place: "" };

export function EventFields({
  idPrefix,
  data,
  errors,
  setField,
}: {
  idPrefix: string;
  data: EventFormData;
  errors: Partial<Record<string, string>>;
  setField: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
}) {
  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-name`}>イベント名 *</label>
        <input
          id={`${idPrefix}-name`}
          value={data.name}
          onChange={(e) => setField("name", e.target.value)}
          required
          maxLength={200}
          autoComplete="off"
        />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`${idPrefix}-date`}>日付</label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            value={data.date}
            onChange={(e) => setField("date", e.target.value)}
          />
          {errors.date && <p className="field-error">{errors.date}</p>}
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-place`}>場所</label>
          <input
            id={`${idPrefix}-place`}
            value={data.place}
            onChange={(e) => setField("place", e.target.value)}
            maxLength={200}
            autoComplete="off"
          />
        </div>
      </div>
    </>
  );
}
