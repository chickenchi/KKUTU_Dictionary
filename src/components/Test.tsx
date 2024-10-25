import React, { useState } from "react";

const subjects = ["Math", "Science", "History", "English"]; // 옵션 목록

const Test: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 필터링된 subjects를 보여줌
    setFilteredSubjects(
      subjects.filter((subject) =>
        subject.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSelect = (subject: string) => {
    setInputValue(subject);
    setFilteredSubjects([]);
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter subject"
      />
      {filteredSubjects.length > 0 && (
        <ul>
          {filteredSubjects.map((subject, index) => (
            <li key={index} onClick={() => handleSelect(subject)}>
              {subject}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Test;
