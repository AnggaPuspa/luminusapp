import Image from 'next/image';
import Link from 'next/link';

interface Course {
  title: string;
  rating: string;
  level: string;
  image: string;
}

interface CourseRecommendationProps {
  course: Course | null;
  visible: boolean;
}

export default function CourseRecommendation({ course, visible }: CourseRecommendationProps) {
  if (!visible || !course) return null;

  return (
    <div className="p-4 border-t">
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <Image
              src={course.image}
              alt="Course thumbnail"
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{course.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500">★</span>
                <span>{course.rating}</span>
                <span className="px-2 py-1 bg-blue-100 text-[#052742] text-xs rounded-full">
                  {course.level}
                </span>
              </div>
            </div>
          </div>
          <Link href="/kursus">
            <button className="w-full mt-4 px-4 py-2 bg-[#696eff] text-white rounded-lg hover:bg-blue-700">
              Lebih Banyak
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
