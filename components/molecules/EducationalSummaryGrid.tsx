import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { InfoRowCard } from '@/components/home/InfoRowCard';

interface EducationalSummaryGridProps {
  followedSubjectsCount: number;
  followedTeachersCount: number;
  libraryVideosCount: number;
  usedCodesCount: number;
}

export const EducationalSummaryGrid: React.FC<EducationalSummaryGridProps> = ({
  followedSubjectsCount,
  followedTeachersCount,
  libraryVideosCount,
  usedCodesCount,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="ملخصك التعليمي"
        subtitle="نظرة عامة على نشاطك وموادك المفعلة"
        iconName="stats-chart-outline"
      />
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <InfoRowCard
            iconName="book-outline"
            title="موادك"
            subtitle={`${followedSubjectsCount} مادة متبوعة`}
            onPress={() => router.push('/subjects')}
          />
          <InfoRowCard
            iconName="people-outline"
            title="مدرسينك"
            subtitle={`${followedTeachersCount} مدرس`}
            onPress={() => router.push('/teachers')}
          />
        </View>
        <View style={styles.statsRow}>
          <InfoRowCard
            iconName="folder-outline"
            title="مكتبتك"
            subtitle={`${libraryVideosCount} درس محفوظ`}
            onPress={() => router.push('/(tabs)/library')}
          />
          <InfoRowCard
            iconName="key-outline"
            title="أكوادك"
            subtitle={`${usedCodesCount} كود مفعل`}
            onPress={() => router.push('/used-codes')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statsGrid: {
    gap: 10,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
