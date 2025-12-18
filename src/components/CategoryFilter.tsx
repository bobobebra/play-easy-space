import { categories, Category } from "@/data/games";

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
}

export const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`category-chip ${selected === category ? "active" : ""}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
